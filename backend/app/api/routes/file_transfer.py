import boto3, time, secrets, string, json, io
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Path
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from cryptography.fernet import Fernet

from app import crud, utils
from app.api.dep import get_current_user, CurrentUser
from app.core.config import settings
from app.core.security import decode_jwt_token
from app.models.db_models import TempUser
from app.models.general_models import Token, Message
from app.models.file_transfer import ResponseURL, PromptUrl, S3Object, DownloadUrl

# Token dependency
reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")
TokenDep = Annotated[str, Depends(reusable_oauth2)]

async def check_temp_user(token: TokenDep):
    payload = decode_jwt_token(token=token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    uploader = await crud.get_or_404(TempUser, id=payload["sub"])
    if not uploader:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return uploader

router = APIRouter(prefix="/file-transfer", tags=["file-transfer"])
s3_client = boto3.client('s3')
prefix = "transfer" #Parent Dir in S3
cipher = Fernet(settings.CIPHER_KEY)

def generate_random_url(exp_hours: int, customer_id: UUID) -> str:
    """
    Generate a secure, encrypted URL with an expiration timestamp.
    """
    current_time = int(time.time())
    exp_in_seconds = exp_hours * 60 * 60  # Convert hours to seconds
    expiration_time = current_time + exp_in_seconds
    payload = {"exp": expiration_time, "user": str(customer_id)} 
    payload_bytes = json.dumps(payload).encode()
    encrypted_payload = cipher.encrypt(payload_bytes).decode()
    return f"{settings.UPLOAD_URL}?token={encrypted_payload}"

def generate_random_string(length: int=10) -> str:
    """
    Generate a random string for username and password.
    """
    characters = string.ascii_letters + string.digits + string.punctuation.replace('"', '').replace('/', '').replace('\\', '')
    return ''.join(secrets.choice(characters) for _ in range(length))

@router.post(
        "/generate-url",
        dependencies=[Depends(get_current_user)],
        response_model=ResponseURL
        )
async def generate_url(info_for_url: PromptUrl):
    username = generate_random_string()
    password = generate_random_string()
    uploader = await TempUser.create(
        name=username,
        pwd=password,
        company_name=info_for_url.company_name,
        type=info_for_url.type,
        file_name=info_for_url.file_name,
    )
    url = generate_random_url(
        exp_hours=info_for_url.expiry_hours, 
        customer_id=uploader.id, 
        )
    return ResponseURL(
        url=url,
        username=username,
        password=password
    )

@router.get("/validate-url")
async def validate_url_route(token: str) -> bool:
    """
    When the customer first clicks the URL, this route validates the token.
    """
    try:
        decrypted_payload_bytes = cipher.decrypt(token.encode())
        decrypted_payload = json.loads(decrypted_payload_bytes.decode())
        exp = int(decrypted_payload["exp"])
        current_time = int(time.time())
        if current_time > exp:
            # To check whether the URL is not reused
            uploader = await crud.get_or_404(TempUser, id=decrypted_payload["customer_id"])
            if uploader is None:
                return False
        return True
    except Exception:
        return False

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    temp_user = await crud.get_or_404(
        TempUser, 
        name=form_data.username, 
        pwd=form_data.password
        )
    if temp_user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Generate tokens
    access_token = utils.generate_utils_token(
        to_encode=temp_user.id, 
        action="file_transfer"
        )
    return Token(access_token=access_token, token_type=temp_user.type)

@router.post("/upload/to-customer", response_model=Message)
async def upload_file_to_customer(
    current_user: CurrentUser, 
    file: UploadFile = File(...)
) -> Message:
    """
    Endpoint to upload a file to customer.
    """
    try:
        # Read the file content
        file_content = await file.read()
        file_location = f"{prefix}/to_customer/{current_user.username.split()[0]}/{file.filename}"
        # Upload the file to S3
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=file_location,
            Body=file_content,
            ContentType=file.content_type
        )

        return Message(message="File uploaded successfully")

    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="AWS credentials not found")
    except PartialCredentialsError:
        raise HTTPException(status_code=500, detail="Incomplete AWS credentials")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/upload/from-customer", response_model=Message)
async def upload_file_from_customer(
    temp_user: Annotated[TempUser, Depends(check_temp_user)], 
    file: UploadFile = File(...)
) -> Message:
    """
    Endpoint for outside company to upload a file.
    """
    if temp_user.type != "upload":
        raise HTTPException(status_code=403, detail="Unauthorized")
    try:
        # Read the file content
        file_content = await file.read()
        file_location = f"{prefix}/from_customer/{temp_user.company_name}/{file.filename}"
        # Upload the file to S3
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=file_location,
            Body=file_content,
            ContentType=file.content_type
        )
        return Message(message="File uploaded successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Please try again later")

@router.get(
        "/files/{folder}",
        dependencies=[Depends(get_current_user)], 
        response_model=list[S3Object],
        )
async def list_files(folder: str):
    try:
        # Request to the S3
        response = s3_client.list_objects_v2(
            Bucket=settings.S3_BUCKET_NAME,
            Prefix=f"{prefix}/{folder}/"
        )
        object_details = [
            S3Object(
                Key='/'.join(obj['Key'].split('/')[-3:]),  # /transfer/folder/name/file -> folder/name/file
                LastModified=obj['LastModified'],
                Size=obj['Size']
            )
            for obj in response.get('Contents', [])
            if obj['Size'] > 0
        ]
        return object_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@router.get("/download/{file_name:path}")
async def download_file(
    current_user: CurrentUser, 
    file_name: str = Path(...)
    ) -> DownloadUrl:
    """
    For operator.
    Endpoint to download files.
    file_name: folder/name/file -> Key: transfer/folder/name/file
    """
    try:
        # Fetch the url from S3
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.S3_BUCKET_NAME, 
                "Key": f"{prefix}/{file_name}",
                "ResponseContentDisposition": "attachment"
                },
            ExpiresIn=30
            )
        
        # Return the url to the client
        return DownloadUrl(
            url=url
        )
    except Exception as e:
        return {"error": str(e)}
    
@router.delete("/delete/{file_name:path}", response_model=Message)
async def delete_file(
    current_user: CurrentUser, 
    file_name: str = Path(...)
    ) -> Message:
    """
    For operator.
    Endpoint to delete files.
    file_name: folder/name/file -> Key: transfer/folder/name/file
    """ 
    try:
        # Fetch the file from S3
        s3_client.delete_object(
            Bucket=settings.S3_BUCKET_NAME, 
            Key=f"{prefix}/{file_name}"
            )
       
        # Stream the file to the client
        return Message(message="Successfully deleted")
    except Exception as e:
        return {"error": str(e)}

@router.get(
    "/my-files/{company_name}", 
    dependencies=[Depends(check_temp_user)], 
    response_model=list[S3Object],
    )
async def list_my_files(company_name: str):
    """
    Route for outside company to list it's files.
    """
    try:
        # Request to the S3
        response = s3_client.list_objects_v2(
            Bucket=settings.S3_BUCKET_NAME,
            Prefix=f"{prefix}/{company_name}/"
        )
        object_details = [
            S3Object(
                Key=obj['Key'].rsplit('/', 1)[-1],  # /transfer/company/fileName -> fileName
                LastModified=obj['LastModified'],
                Size=obj['Size']
            )
            for obj in response.get('Contents', []) # /transfer/company 0 bytes, deletion
            if obj['Size'] > 0
        ]
        return object_details
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
@router.get("/download-my-files/{file_name}")
async def download_my_file(
    file_name: str, 
    current_temp_user: Annotated[TempUser, Depends(check_temp_user)]
    ):
    """
    Endpoint for outside company to download it's file.
    """
    try:
        # Fetch the file from S3
        s3_object = s3_client.get_object(
            Bucket=settings.S3_BUCKET_NAME, 
            Key=f"{prefix}/{current_temp_user.company_name}/{file_name}"
            )
        file_stream = io.BytesIO(s3_object["Body"].read())
        
        # Stream the file to the client
        return StreamingResponse(
            file_stream,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={file_name}"},
        )
    except Exception as e:
        return {"error": str(e)}