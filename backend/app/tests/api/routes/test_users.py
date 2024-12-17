import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock

from app import crud
from app.models.db_models import User
from app.models.user_models import UserCreate
from app.core.config import settings
from app.core.security import verify_secret
from app.tests.utils.user import create_random_user
from app.tests.utils.utils import random_email, random_lower_string, random_integer

@pytest.mark.anyio
async def test_get_users_superuser_me(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    r = await client.get(f"{settings.API_V1_STR}/users/me", headers=superuser_token_headers)
    current_user = r.json()
    assert current_user
    assert current_user["is_active"] is True
    assert current_user["is_superuser"]
    assert current_user["email"] == settings.FIRST_SUPERUSER

@pytest.mark.anyio
async def test_get_users_normal_user_me(
    client: AsyncClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = await client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    current_user = r.json()
    assert current_user
    assert current_user["is_active"] is True
    assert current_user["is_superuser"] is False
    assert current_user["email"] == settings.EMAIL_TEST_USER

@pytest.mark.anyio
async def test_get_existing_user(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    user = await create_random_user()
    user_id = user.id

    r = await client.get(
        f"{settings.API_V1_STR}/users/{user_id}",
        headers=superuser_token_headers,
    )
    assert 200 <= r.status_code < 300
    api_user = r.json()
    existing_user = await User.get(id=user.id)
    assert existing_user
    assert existing_user.email == api_user["email"]
    assert existing_user.username == api_user["username"]

@pytest.mark.anyio
async def test_get_non_existing_user(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    non_existent_user_id = 999999
    r = await client.get(
        f"{settings.API_V1_STR}/users/{non_existent_user_id}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 404
    assert r.json() == {"detail": "User not found"}

@pytest.mark.anyio
async def test_get_existing_user_permissions_error(
    client: AsyncClient, normal_user_token_headers: dict[str, str]
) -> None:
    user_id = random_integer()
    r = await client.get(
        f"{settings.API_V1_STR}/users/{user_id}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 403
    assert r.json() == {"detail": "The user doesn't have enough privileges"}


@pytest.mark.anyio
async def test_register_user(
    client: AsyncClient, superuser_token_headers: dict
) -> None:
    email = random_email()
    username = random_lower_string()

    data = {"email": email, "username": username}

    mock_email_response = AsyncMock()
    mock_email_response.status_code = 200
    # Mock only the email sending function, skip the rest
    with patch("app.utils.send_email", return_value=mock_email_response):  # Skipping actual email send
        r = await client.post(
            f"{settings.API_V1_STR}/users/adduser", 
            headers=superuser_token_headers, 
            json=data
        )
        assert 200 <= r.status_code < 300
        created_user = await User.get(email=email)
        assert created_user is not None
        assert created_user.email == email
        assert created_user.username == username

@pytest.mark.anyio
async def test_register_user_permission_error(
    client: AsyncClient, normal_user_token_headers: dict
) -> None:
    username = random_email()

    data = {"email": username}

    mock_email_response = AsyncMock()
    mock_email_response.status_code = 200
    # Mock only the email sending function, skip the rest
    with patch("app.utils.send_email", return_value=mock_email_response):  # Skipping actual email send
        r = await client.post(
            f"{settings.API_V1_STR}/users/adduser", 
            headers=normal_user_token_headers, 
            json=data
        )
        assert r.status_code == 403
        assert r.json() == {"detail": "The user doesn't have enough privileges"}

@pytest.mark.anyio
async def test_register_user_existing_username(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    user = await create_random_user()
    data = {"email": user.email, "username": user.username}

    mock_email_response = AsyncMock()
    mock_email_response.status_code = 200

    # Mock only the email sending function, skip the rest
    with patch("app.utils.send_email", return_value=mock_email_response):  # Skipping actual email send
        r = await client.post(
            f"{settings.API_V1_STR}/users/adduser", 
            headers=superuser_token_headers, 
            json=data
        )
    created_user = r.json()
    assert r.status_code == 400
    assert "_id" not in created_user

@pytest.mark.anyio
async def test_register_user_normal_user(
    client: AsyncClient, normal_user_token_headers: dict[str, str]
) -> None:
    user = await create_random_user()
    data = {"email": user.email}

    mock_email_response = AsyncMock()
    mock_email_response.status_code = 200

    # Mock only the email sending function, skip the rest
    with patch("app.utils.send_email", return_value=mock_email_response):  # Skipping actual email send
        r = await client.post(
            f"{settings.API_V1_STR}/users/adduser", 
            headers=normal_user_token_headers, 
            json=data
        )
    assert r.status_code == 403

@pytest.mark.anyio
async def test_retrieve_users(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    await create_random_user()
    await create_random_user()

    r = await client.get(f"{settings.API_V1_STR}/users/", headers=superuser_token_headers)
    all_users = r.json()

    assert len(all_users["data"]) > 1
    assert "count" in all_users
    for item in all_users["data"]:
        assert "email" in item
        assert "username" in item

@pytest.mark.anyio
async def test_update_password_me(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    new_password = random_lower_string()
    data = {
        "current_password": settings.FIRST_SUPERUSER_PASSWORD,
        "new_password": new_password,
    }
    r = await client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_user = r.json()
    assert updated_user["message"] == "Password updated successfully"

    user_db = await User.get(email=settings.FIRST_SUPERUSER)
    assert user_db
    assert user_db.email == settings.FIRST_SUPERUSER
    assert verify_secret(new_password, user_db.hashed_password)

    # Revert to the old password to keep consistency in test
    old_data = {
        "current_password": new_password,
        "new_password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = await client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=superuser_token_headers,
        json=old_data,
    )
    await user_db.refresh_from_db()

    assert r.status_code == 200
    assert verify_secret(settings.FIRST_SUPERUSER_PASSWORD, user_db.hashed_password)

@pytest.mark.anyio
async def test_update_password_me_incorrect_password(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    new_password = random_lower_string()
    data = {
        "current_password": new_password,
        "new_password": new_password,
    }
    r = await client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 400
    updated_user = r.json()
    assert updated_user["detail"] == "Incorrect password"

@pytest.mark.anyio
async def test_update_password_me_incorrect_password(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "current_password": settings.FIRST_SUPERUSER_PASSWORD,
        "new_password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = await client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 400
    updated_user = r.json()
    assert (
        updated_user["detail"] == "New password cannot be the same as the current one"
    )

@pytest.mark.anyio
async def test_update_user(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    user = await create_random_user()

    data = {"username": "Updated_full_name", "is_superuser": "true", "is_active": "false", "can_edit": "true"}
    r = await client.patch(
        f"{settings.API_V1_STR}/users/{user.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_user = r.json()

    assert updated_user["username"] == "Updated_full_name"
    assert updated_user["is_superuser"]
    assert updated_user["can_edit"]
    assert updated_user["is_active"] is False

    created_user = await User.get(id=user.id)
    assert created_user
    assert created_user.username == "Updated_full_name"
    assert created_user.is_superuser
    assert created_user.can_edit
    assert created_user.is_active is False


@pytest.mark.anyio
async def test_update_non_existing_user(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    non_existent_user_id = 999999
    data = {"username": "Updated_full_name", "is_superuser": "true", "is_active": "false"}
    r = await client.patch(
        f"{settings.API_V1_STR}/users/{non_existent_user_id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "User not found"

@pytest.mark.anyio
async def test_update_super_user_own(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    user = await User.get(email=settings.FIRST_SUPERUSER)
    data = {"username": "Updated_full_name", "is_superuser": "true", "is_active": "false"}
    r = await client.patch(
        f"{settings.API_V1_STR}/users/{user.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "Super users are not allowed to update themselves"

@pytest.mark.anyio
async def test_delete_user(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    user = await create_random_user()
    user_id = user.id

    r = await client.delete(
        f"{settings.API_V1_STR}/users/{user_id}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 200
    deleted_user = r.json()
    assert deleted_user["message"] == "User deleted successfully"
    result = await User.get_or_none(id=user_id)
    assert result is None

@pytest.mark.anyio
async def test_delete_user_me_as_superuser(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    superuser = await User.get(email=settings.FIRST_SUPERUSER)
    assert superuser
    r = await client.delete(
        f"{settings.API_V1_STR}/users/{superuser.id}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 403
    response = r.json()
    assert response["detail"] == "Super users are not allowed to delete themselves"

@pytest.mark.anyio
async def test_delete_non_existing_user(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    non_existent_user_id = 999999
    r = await client.delete(
        f"{settings.API_V1_STR}/users/{non_existent_user_id}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "User not found"

@pytest.mark.anyio
async def test_delete_user_without_privileges(
    client: AsyncClient, normal_user_token_headers: dict[str, str]
) -> None:
    user = await create_random_user()
    
    r = await client.delete(
        f"{settings.API_V1_STR}/users/{user.id}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "The user doesn't have enough privileges"