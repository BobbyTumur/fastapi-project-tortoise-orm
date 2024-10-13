from httpx import AsyncClient

from app import crud
from app.core.config import settings
from app.models import UserCreate
from app.tests.utils.utils import random_lower_string


async def get_normal_user_token_headers(client: AsyncClient, email: str,) -> dict[str, str]:
    password = random_lower_string()
    user_in_create = UserCreate(email=email, password=password)
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
