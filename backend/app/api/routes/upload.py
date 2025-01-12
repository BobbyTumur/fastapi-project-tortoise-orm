import boto3, time, secrets, string, json
from typing import Annotated
from uuid import UUID
import logging

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from cryptography.fernet import Fernet

from app import crud, utils
from app.api.dep import get_current_user
from app.core.config import settings
from app.core.security import decode_jwt_token
from app.models.db_models import TempUser
from app.models.upload_models import ResponseURL, PromptURL
from app.models.general_models import Token, Message

# Token dependency
reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")
TokenDep = Annotated[str, Depends(reusable_oauth2)]

async def check_user(token: TokenDep):
    payload = decode_jwt_token(token=token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    uploader = await crud.get_or_404(TempUser, id=payload["sub"])
    if not uploader:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return uploader

router = APIRouter(prefix="/upload", tags=["upload"])
s3_client = boto3.client('s3')
cipher = Fernet(settings.CIPHER_KEY)

def generate_random_url(exp_min: int, customer_id: UUID) -> str:
    """
    Generate a secure, encrypted URL with an expiration timestamp.
    """
    current_time = int(time.time())
    exp_in_seconds = exp_min * 60  # Convert minutes to seconds
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
async def generate_url(info_for_url: PromptURL):
    username = generate_random_string()
    password = generate_random_string()
    uploader = await TempUser.create(
        name=username,
        pwd=password,
        company_name=info_for_url.company_name
    )
    # uploaderd = await crud.get_or_404(TempUser,name=username)
    url = generate_random_url(exp_min=info_for_url.expiry_minutes, customer_id=uploader.id)
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
    uploader_data = await crud.get_or_404(
        TempUser, 
        name=form_data.username, 
        pwd=form_data.password
        )
    if uploader_data is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Generate tokens
    access_token = utils.generate_utils_token(
        to_encode=uploader_data.id, 
        action="upload"
        )
    return Token(access_token=access_token)


@router.post("/upload", response_model=Message)
async def upload_file(
    current_uploader: Annotated[TempUser,Depends(check_user)], 
    file: UploadFile = File(...)
    ) -> Message:
    try:
        # Read the file content
        file_content = await file.read()

        logging.info(f"File received: {file.filename}")
        logging.info(f"Uploader's company name: {current_uploader.company_name}")


        # Upload the file to S3
        file_location = f"問い合わせ/{file.filename}-{current_uploader.company_name}"
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
        logging.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")