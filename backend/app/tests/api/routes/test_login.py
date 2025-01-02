import pytest, jwt
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock

from app import crud, utils
from app.core import security
from app.models.db_models import User
from app.models.user_models import UserCreate
from app.utils import generate_email_token
from app.core.config import settings
from app.core.security import verify_secret, decode_jwt_token
from app.tests.utils.utils import random_email, random_lower_string


@pytest.mark.anyio
async def test_get_access_token(client: AsyncClient) -> None:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = await client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in tokens
    assert tokens["access_token"]


@pytest.mark.anyio
async def test_get_access_token_incorrect_password(client: AsyncClient) -> None:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": random_lower_string(),
    }
    r = await client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    assert r.status_code == 400
    assert r.json() == {"detail": "Incorrect email or password"}

@pytest.mark.anyio
async def test_get_access_token_inactive_user(client: AsyncClient) -> None:
    email = random_email()
    username = random_lower_string()
    password = random_lower_string()
    user_in = UserCreate(email=email, username=username ,password=password, is_active=False)
    await crud.create_user(user_create=user_in)

    login_data = {
        "username": email,
        "password": password,
    }
    r = await client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    assert r.status_code == 400
    assert r.json() == {"detail": "Inactive user"}

# @pytest.mark.anyio
# async def test_validate_totp(client: AsyncClient) -> None:
#     email = random_email()
#     username = random_lower_string()
#     password = random_lower_string()
#     user_in = UserCreate(email=email, username=username ,password=password, is_totp_enabled=True)
#     await crud.create_user(user_create=user_in)

#     login_data = {
#         "username": email,
#         "password": password,
#     }
#     r = await client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
#     token = r.json()
#     assert r.status_code == 200
#     decoded_token = decode_jwt_token(token=token)
#     assert


@pytest.mark.anyio
async def test_refresh_access_token(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    r = await client.get(
        f"{settings.API_V1_STR}/users/me", 
        headers=superuser_token_headers,
        )
    superuser = r.json()
    cookie = security.create_refresh_token(superuser["id"])
    client.cookies.set("refresh_token", cookie)
    r = await client.post(
        f"{settings.API_V1_STR}/login/refresh-token", 
        headers=superuser_token_headers
        )
    access_token = r.json()
    assert r.status_code == 200
    assert "access_token" in access_token
    decoded_access_token = security.decode_jwt_token(access_token["access_token"])
    assert decoded_access_token["sub"] == superuser["id"]

    assert "refresh_token" in r.cookies
    refresh_token = r.cookies["refresh_token"]
    decoded_refresh_token = security.decode_jwt_token(refresh_token)
    assert decoded_refresh_token["sub"] == superuser["id"]

    assert decoded_access_token["exp"] < decoded_refresh_token["exp"]


@pytest.mark.anyio
async def test_recovery_password(client: AsyncClient) -> None:
    email = random_email()
    username = random_lower_string()
    password = random_lower_string()
    user_in = UserCreate(email=email, username=username, password=password)
    await crud.create_user(user_create=user_in)

    mock_email_response = AsyncMock()
    mock_email_response.status_code = 200

    # Mock only the email sending function, skip the rest
    with patch("app.utils.send_email", return_value=mock_email_response):  # Skipping actual email send
        r = await client.post(
            f"{settings.API_V1_STR}/password-recovery/{email}",
        )
        assert r.status_code == 200
        assert r.json() == {"message": "Password recovery email sent"}

@pytest.mark.anyio
async def test_recovery_password_non_existing_user(client: AsyncClient) -> None:
    email = random_email()
    r = await client.post(
        f"{settings.API_V1_STR}/password-recovery/{email}"
    )
    assert r.status_code == 404

@pytest.mark.anyio
async def test_reset_password(client: AsyncClient) -> None:
    token = generate_email_token(email_to_encode=settings.FIRST_SUPERUSER, action="reset")
    new_password = random_lower_string()
    data = {"token": token, "new_password": new_password}
    r = await client.post(
        f"{settings.API_V1_STR}/reset-password",
        json=data
    )
    assert r.status_code == 200
    assert r.json() == {"message": "Password updated successfully"}

    user = await User.get(email=settings.FIRST_SUPERUSER)
    assert user
    assert verify_secret(data["new_password"], user.hashed_password)

@pytest.mark.anyio
async def test_reset_password_invalid_token(client: AsyncClient) -> None:
    token = random_lower_string()
    new_password = random_lower_string()
    data = {"token": token, "new_password": new_password}
    r = await client.post(
        f"{settings.API_V1_STR}/reset-password",
        json=data,
    )
    response = r.json()

    assert "detail" in response
    assert r.status_code == 400
    assert response["detail"] == "Invalid token"

@pytest.mark.anyio
async def test_set_up_password(client: AsyncClient) -> None:
    token = generate_email_token(email_to_encode=settings.FIRST_SUPERUSER, action="setup")
    new_password = random_lower_string()
    data = {"token": token, "new_password": new_password}
    mock_email_response = AsyncMock()
    mock_email_response.status_code = 200

    # Mock only the email sending function, skip the rest
    with patch("app.utils.send_email", return_value=mock_email_response):  # Skipping actual email send
        r = await client.post(
            f"{settings.API_V1_STR}/setup-password",
            json=data
        )
        assert r.status_code == 200
        assert r.json() == {"message": "Password set up is successful"}

        user = await User.get(email=settings.FIRST_SUPERUSER)
        assert user
        assert verify_secret(data["new_password"], user.hashed_password)

@pytest.mark.anyio
async def test_setup_password_invalid_token(client: AsyncClient) -> None:
    token = random_lower_string()
    new_password = random_lower_string()
    data = {"token": token, "new_password": new_password}
    
    r = await client.post(
        f"{settings.API_V1_STR}/setup-password",
        json=data,
    )
    response = r.json()

    assert "detail" in response
    assert r.status_code == 400
    assert response["detail"] == "Invalid token"