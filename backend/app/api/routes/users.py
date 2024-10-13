from typing import Any

from tortoise.transactions import in_transaction
from fastapi import APIRouter, Depends, HTTPException

from app import crud, utils
from app.api.dep import CurrentUser, get_current_active_superuser
from app.core.security import get_password_hash, verify_password
from app.models import UserDatabase, UserPublic, UsersPublic, UserRegister, UserCreate, Message, UpdatePassword, UserUpdate, UserUpdateMe

router = APIRouter()

@router.get("/", dependencies=[Depends(get_current_active_superuser)], response_model=UsersPublic)
async def read_users(skip: int = 0, limit: int = 100):
    """
    Retreive users.
    """
    users = await UserDatabase.all().offset(skip).limit(limit)
    count = await UserDatabase.all().count()
    return UsersPublic(data=users, count=count)

@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/{user_id}", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic)
async def read_user_by_id(user_id: int) -> Any:
    """
    Get a specific user by id.
    """
    user = await crud.get_user_by_id(user_id=user_id)
    if user == None:
        raise HTTPException(status_code=404,detail="User not found")
    return user

@router.post("/adduser",dependencies=[Depends(get_current_active_superuser)])
async def register_user(user_in: UserRegister) -> Message:
    """
    Create new user without the need to be logged in.
    """
    async with in_transaction() as transaction:
        user = await crud.get_user_by_email(email=user_in.email)
        if user:
            raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
        user_data = user_in.model_dump()
        user_data.update({"password": "PASSWORD_PLACEHOLDER"})
        user_create = UserCreate(**user_data)

        # Create the user but do not commit yet (within transaction)
        user = await crud.create_user(user_create=user_create)

        # Generate email token and email data
        password_setup_token = utils.generate_email_token(email_to_encode=user.email, action="setup")
        email_data = utils.generate_resetup_password_email(
            email_to=user.email, email=user.email, token=password_setup_token, action="setup"
        )

        # Attempt to send email
        email_response = await utils.send_email(
            email_to=user.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
            )
        
        # If email sending fails, raise an exception to roll back the transaction
        if not email_response:
            await transaction.rollback()
            raise HTTPException(
                status_code=500,
                detail="Mail is not sent successfully, probably mail server issue",
            )
        return Message(message="Password set up email sent")

@router.patch("/me", response_model=UserPublic)
async def update_user_me(user_in: UserUpdateMe, current_user: CurrentUser) -> Any:
    """
    Update own user.
    """
    current_user.username = user_in.username
    await current_user.save()
    return current_user

@router.patch("/me/password", response_model=Message)
async def update_password_me(body: UpdatePassword, current_user: CurrentUser) -> Any:
    """
    Update own password.
    """
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    await current_user.save()
    return Message(message="Password updated successfully")

@router.patch("/{user_id}", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic)
async def update_user(current_user: CurrentUser, user_id: int, user_in: UserUpdate) -> Any:
    """
    Update a user.
    """
    db_user = await crud.get_user_by_id(user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if db_user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to update themselves"
        )
    db_user = await crud.update_user(db_user=db_user, user_in=user_in)
    return db_user

@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
async def delete_user(current_user: CurrentUser, user_id: int) -> Message:
    """
    Delete a user.
    """
    user = await crud.get_user_by_id(user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    await user.delete()
    return Message(message="User deleted successfully")