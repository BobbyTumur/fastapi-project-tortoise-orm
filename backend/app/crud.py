from typing import Any
from tortoise.exceptions import DoesNotExist

from app.core.security import get_password_hash, verify_password
from app.models import UserDatabase, UserCreate, UserUpdate



async def create_user(*, user_create: UserCreate) -> UserDatabase:
    user_data = user_create.model_dump()
    user_data['hashed_password'] = get_password_hash(user_create.password)
    user = await UserDatabase.create(**user_data)
    return user

async def update_user(*, db_user: UserDatabase, user_in: UserUpdate) -> UserDatabase:
    update_data = user_in.model_dump(exclude_unset=True)
    db_user.update_from_dict(update_data)
    await db_user.save()
    return db_user

async def get_user_by_email(*, email: str) -> UserDatabase | None:
    try:
        user = await UserDatabase.get(email=email)
        return user
    except DoesNotExist:
        return None

async def get_user_by_id(*, user_id: int) -> UserDatabase | None:
    try: 
        user = await UserDatabase.get(id=user_id)
        return user
    except DoesNotExist:
        return None

async def authenticate(*, email: str, password: str) -> UserDatabase | None:
    db_user = await get_user_by_email(email=email)
    if not db_user or not verify_password(password, db_user.hashed_password):
        return None
    return db_user