from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app import crud, utils
from app.core import security
from app.core.config import settings
from app.models.db_models import User
from app.models.general_models import Token,  Message, NewPassword

router = APIRouter(tags=["login"])

@router.post("/login/access-token")
async def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
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
    return Token(
        access_token=security.create_access_token(user.id, expires_delta=access_token_expires)
    )

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
            email_to=user.email, username=user.email, password=body.new_password
        )
        await utils.send_email(
            email_to=user.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )   
    return Message(message="Password set up is successful")