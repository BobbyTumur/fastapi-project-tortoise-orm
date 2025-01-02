import pytest, pyotp, uuid
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock

from app import crud
from app.models.db_models import User
from app.models.user_models import UserCreate
from app.core.config import settings
from app.core.security import verify_secret
from app.tests.utils.user import create_user_and_login
from app.tests.utils.services import create_random_service
from app.tests.utils.utils import random_email, random_lower_string, random_integer

@pytest.mark.anyio
async def test_enable_totp(
    client: AsyncClient
) -> None:
    user, headers = await create_user_and_login(client)
    r = await client.post(f"{settings.API_V1_STR}/totp/enable", headers=headers)

    assert r.status_code == 200
    user = await User.get(id=user.id)
    assert user.totp_secret != None

# @pytest.mark.anyio
# async def test_enable_totp_already_enabled(
#     client: AsyncClient
# ) -> None:
#     email = random_email()
#     username = random_lower_string()
#     password = random_lower_string()
#     is_totp_enabled = True
#     user_in_create = UserCreate(
#         email=email, 
#         username=username,
#         password=password,
#         is_totp_enabled=is_totp_enabled
#         )
#     user = await crud.create_user(user_create=user_in_create)

#     login_data = {"username": user.email, "password": password}

#     r = await client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
#     token = r.json()
#     auth_token = token["access_token"]
#     headers = {"Authorization": f"Bearer {auth_token}"}
#     r = await client.post(f"{settings.API_V1_STR}/totp/enable", headers=headers)


#     assert 400 <= r.status_code < 500
#     user = await User.get(id=user.id)
#     assert user.totp_secret != False

@pytest.mark.anyio
async def test_verify_totp(
    client: AsyncClient
) -> None:
    user, headers = await create_user_and_login(client)
    r = await client.post(
        f"{settings.API_V1_STR}/totp/enable", 
        headers=headers,
        )
    user = await User.get(id=user.id)

    assert r.status_code == 200
    user = await User.get(id=user.id)
    # Extract the TOTP secret from the user object
    totp_secret = user.totp_secret
    assert totp_secret is not None
    # Generate a TOTP token using the secret
    totp = pyotp.TOTP(totp_secret)
    totp_token = totp.now()
    verify_data = {"token": totp_token}
    r = await client.post(
        f"{settings.API_V1_STR}/totp/verify", 
        headers=headers, 
        json=verify_data
        )
    assert r.status_code == 200
    user = await User.get(id=user.id)
    assert user.is_totp_enabled == True

@pytest.mark.anyio
async def test_verify_fake_totp(
    client: AsyncClient
) -> None:
    user, headers = await create_user_and_login(client)
    r = await client.post(
        f"{settings.API_V1_STR}/totp/enable", 
        headers=headers,
        )
    user = await User.get(id=user.id)

    assert r.status_code == 200
    user = await User.get(id=user.id)
    # Extract the TOTP secret from the user object
    totp_secret = random_lower_string()
    totp = pyotp.TOTP(totp_secret)
    totp_token = totp.now()
    verify_data = {"token": totp_token}
    r = await client.post(
        f"{settings.API_V1_STR}/totp/verify", 
        headers=headers, 
        json=verify_data
        )
    assert r.status_code == 400
    user = await User.get(id=user.id)
    assert user.is_totp_enabled != True

@pytest.mark.anyio
async def test_disable_totp(
    client: AsyncClient
) -> None:
    user, headers = await create_user_and_login(client)
    r = await client.post(
        f"{settings.API_V1_STR}/totp/enable", 
        headers=headers,
        )
    user = await User.get(id=user.id)

    assert r.status_code == 200
    user = await User.get(id=user.id)
    # Extract the TOTP secret from the user object
    totp_secret = user.totp_secret
    assert totp_secret is not None
    # Generate a TOTP token using the secret
    totp = pyotp.TOTP(totp_secret)
    totp_token = totp.now()
    verify_data = {"token": totp_token}
    r = await client.post(
        f"{settings.API_V1_STR}/totp/verify", 
        headers=headers, 
        json=verify_data
        )

    r = await client.delete(f"{settings.API_V1_STR}/totp/disable", headers=headers)


    assert 200 <= r.status_code < 300
    user = await User.get(id=user.id)
    assert user.totp_secret == None
    assert user.is_totp_enabled == False