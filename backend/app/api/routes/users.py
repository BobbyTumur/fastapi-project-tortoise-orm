from typing import Any

from tortoise.transactions import in_transaction
from fastapi import APIRouter, Depends, HTTPException

from app import utils, crud
from app.api.dep import CurrentUser, get_current_active_superuser
from app.core.security import get_password_hash, verify_password
from app.models.db_models import UserDatabase, ServiceDatabase
from app.models.service_models import ServicePublic
from app.models.user_models import UserPublic, UsersPublic, UserRegister, UserCreate, Message, UpdatePassword, UserUpdate, UserUpdateServices

router = APIRouter(prefix="/users", tags=["users"])

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
    user = await UserDatabase.get_or_none(id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/adduser",dependencies=[Depends(get_current_active_superuser)])
async def register_user(user_in: UserRegister) -> Message:
    """
    Create new user without the need to be logged in.
    """
    async with in_transaction() as transaction:
        user = await UserDatabase.get_or_none(email=user_in.email)
        if user is not None:
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
                detail="Mail server error, try again later",
            )
        return Message(message="Password set up email sent")

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
    user = await UserDatabase.get_or_none(id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to update themselves"
        )
    user = await crud.update_user(db_user=user, user_in=user_in)
    return user

@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
async def delete_user(current_user: CurrentUser, user_id: int) -> Message:
    """
    Delete a user.
    """
    user = await UserDatabase.get_or_none(id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    await user.delete()
    return Message(message="User deleted successfully")

@router.get("/{user_id}/services", 
              dependencies=[Depends(get_current_active_superuser)],
              response_model=list[ServicePublic])
async def get_user_services(
    user_id: int,
) -> list[ServicePublic]:
    """
    Get user's services
    """
    user = await UserDatabase.get_or_none(id=user_id).prefetch_related("services")
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    services = await user.services.all()
    return services


@router.patch("/{user_id}/services", 
              dependencies=[Depends(get_current_active_superuser)],
              response_model=Message)
async def add_services_to_user(
    user_id: int,
    services_in: UserUpdateServices
) -> Message:
    """
    Add services to a user by IDs.
    """
    user = await UserDatabase.get_or_none(id=user_id).prefetch_related("services")
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    # Process 'add_services'
    for service_id in services_in.add_services:
        service = await ServiceDatabase.get_or_none(id=service_id)
        if not service:
            raise HTTPException(status_code=404, detail=f"Service with ID {service_id} not found")
        
        is_associated = await user.services.filter(id=service.id).exists()
        if not is_associated:
            await user.services.add(service)

    # Process 'remove_services'
    for service_id in services_in.remove_services:
        service = await ServiceDatabase.get_or_none(id=service_id)
        if not service:
            raise HTTPException(status_code=404, detail=f"Service with ID {service_id} not found")
        
        is_associated = await user.services.filter(id=service.id).exists()
        if is_associated:
            await user.services.remove(service)

    return Message(message="User services updated successfully")