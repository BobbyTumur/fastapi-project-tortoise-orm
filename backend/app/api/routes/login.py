from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import OAuth2PasswordRequestForm

from app import crud, utils
from app.core import security
from app.core.config import settings
from app.api.dep import TotpUser
from app.models.db_models import User
from app.models.general_models import Token, Message, NewPassword, TOTPToken

router = APIRouter(tags=["login"])

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await crud.get_or_404(User, email=form_data.username)
    if not user or not security.verify_secret(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    # If TOTP is enabled, return True
    if user.is_totp_enabled:
        return Token(
            access_token=security.create_access_token(
                subject=user.id, 
                expires_delta=access_token_expires/3,
                totp_verified=False
                ),
            token_type="totp"
            )
    
    # Generate tokens
    access_token = security.create_access_token(subject=user.id, expires_delta=access_token_expires, totp_verified=True)
    refresh_token =  security.create_refresh_token(subject=user.id)

    # Send the refresh token in an HttpOnly cookie
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token, 
        httponly=True, 
        secure=False,  # HTTPS prod, HTTP local
        samesite="None",
        path="/"
    )
    return Token(access_token=access_token)

@router.post("/login/validate-totp")
async def validate_totp(
    current_user: TotpUser,
    totp_token: TOTPToken,
    response: Response,
) -> Token:
    """
    Validate TOTP code and issue an access token
    """
    # Validate the TOTP code
    is_valid_totp = security.verify_totp(totp=totp_token.token, user_secret=current_user.totp_secret)
    
    if not is_valid_totp:
        raise HTTPException(status_code=401, detail="Invalid TOTP code")
    
    # If TOTP is valid, issue the access token
    # Generate tokens
    access_token = security.create_access_token(
        subject=current_user.id, 
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), 
        totp_verified=True
        )
    refresh_token =  security.create_refresh_token(subject=current_user.id)

    # Send the refresh token in an HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Use True for HTTPS in production
        samesite="None",  # Use "None" if CORS is cross-origin and HTTPS is used
        path="/"
    )

    return Token(access_token=access_token)

@router.post("/login/refresh-token", response_model=Token)
async def refresh_access_token(
    request: Request,
    response: Response,
) -> Token:
    """
    Refresh the access token using the refresh token stored in the cookie.
    """
    # Check if the refresh token exists in cookies
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token missing")
    
    # Validate and decode the refresh token
    try:
        payload = security.decode_jwt_token(refresh_token)
    except security.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid or expired refresh token")

    # Extract user ID from the token payload
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token payload")

    # Fetch the user from the database
    user = await crud.get_or_404(User, id=user_id)
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive or invalid user")

    # Generate a new access token and refresh token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires, totp_verified=True
    )
    new_refresh_token = security.create_refresh_token(subject=user.id)

    # Set the new refresh token as an HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,  # Use True for HTTPS in production
        samesite="None",  # Use "None" if CORS is cross-origin and HTTPS is used
        path="/"
    )
    # Return the new access token as a Token schema
    return Token(access_token=access_token)

    

@router.post("/password-recovery/{email}")
async def recover_password(email: str) -> Message:
    """
    Password Recovery
    """
    user = await crud.get_or_404(User, email=email)
    password_reset_token = utils.generate_email_token(email_to_encode=email, action="reset")
    email_data = utils.generate_resetup_password_email(
        email_to=user.email, email=email, token=password_reset_token, action="reset"
    )
    email_response = await utils.send_email(
        email_to=user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
        )
    if not email_response:
        raise HTTPException(
            status_code=500,
            detail="Mail is not sent successfully, probably mail server issue",
        )
    return Message(message="Password recovery email sent")

@router.post("/reset-password")
async def reset_password(body: NewPassword) -> Message:
    """
    Reset password
    """
    email = utils.verify_password_reset_token(token=body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = await crud.get_or_404(User, email=email)
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    hashed_password = security.get_secret_hash(body.new_password)
    user.hashed_password = hashed_password
    await user.save()
    return Message(message="Password updated successfully")

@router.post("/setup-password")
async def set_up_password(body: NewPassword) -> Message:
    """
    Set up password
    """
    email = utils.verify_password_reset_token(token=body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = await crud.get_or_404(User, email=email)
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    hashed_password = security.get_secret_hash(body.new_password)
    user.hashed_password = hashed_password
    await user.save()

    if settings.emails_enabled and user.email:
        email_data = utils.generate_new_account_email(
            email_to=user.email, username=user.email
        )
        await utils.send_email(
            email_to=user.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )   
    return Message(message="Password set up is successful")