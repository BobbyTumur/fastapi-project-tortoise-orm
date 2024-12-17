from httpx import AsyncClient

from app import crud
from app.core.config import settings
from app.models.db_models import User
from app.models.user_models import UserCreate
from app.tests.utils.utils import random_lower_string, random_email


async def create_random_user() -> User:
    email = random_email()
    username = random_lower_string()
    password = random_lower_string()
    user_in = UserCreate(email=email, username=username, password=password)
    user = await crud.create_user(user_create=user_in)
    return user


async def get_normal_user_token_headers(client: AsyncClient, email: str,) -> dict[str, str]:
    username = random_lower_string()
    password = random_lower_string()
    user_in_create = UserCreate(email=email, username=username ,password=password)
    user = await crud.create_user(user_create=user_in_create)

    login_data = {"username": user.email, "password": password}

    r = await client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    token = r.json()
    auth_token = token["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers


async def get_superuser_token_headers(client: AsyncClient) -> dict[str, str]:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }

    r = await client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    auth_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers
