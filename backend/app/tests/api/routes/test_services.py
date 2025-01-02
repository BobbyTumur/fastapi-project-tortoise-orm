import pytest
from httpx import AsyncClient

from app import crud
from app.core.config import settings
from app.models.db_models import Service
from app.tests.utils.services import create_random_service 
from app.tests.utils.utils import random_email, random_lower_string



@pytest.mark.anyio
async def test_get_services(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    await create_random_service()
    await create_random_service()
    r = await client.get(f"{settings.API_V1_STR}/services/", headers=superuser_token_headers)
    all_services = r.json()

    assert len(all_services["data"]) > 1
    assert all_services["count"] == 2

@pytest.mark.anyio
async def test_get_service(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    r = await client.get(
        f"{settings.API_V1_STR}/services/{service_request.id}", 
        headers=superuser_token_headers,
        )
    
    assert r.status_code == 200
    service_response = r.json()
    assert service_response["name"] == service_request.name

@pytest.mark.anyio
async def test_get_service_users(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    r = await client.get(
        f"{settings.API_V1_STR}/services/{service_request.id}/users", 
        headers=superuser_token_headers,
        )
    
    assert r.status_code == 200
    service_response = r.json()
    assert service_response["usernames"] == [settings.FIRST_USER_NAME]

@pytest.mark.anyio
async def test_create_service(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    service_name = random_lower_string()
    service_sub_name = random_lower_string()
    data = {
        "name": service_name,
        "sub_name": service_sub_name
    }
    r = await client.post(
        f"{settings.API_V1_STR}/services/", 
        headers=superuser_token_headers,
        json=data
        )
    assert r.status_code == 200
    service_response = r.json()
    assert service_response["name"] == service_name
    assert service_response["sub_name"] == service_sub_name 

@pytest.mark.anyio
async def test_create_service_non_superuser(
    client: AsyncClient, normal_user_token_headers: dict[str, str]
) -> None:
    service_name = random_lower_string()
    service_sub_name = random_lower_string()
    data = {
        "name": service_name,
        "sub_name": service_sub_name
    }
    r = await client.post(
        f"{settings.API_V1_STR}/services/", 
        headers=normal_user_token_headers,
        json=data
        )
    assert r.status_code == 403

@pytest.mark.anyio
async def test_create_service_already_registered_service(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    data = {
        "name": service_request.name,
        "sub_name": service_request.sub_name
    }
    r = await client.post(
        f"{settings.API_V1_STR}/services/", 
        headers=superuser_token_headers,
        json=data
        )
    assert r.status_code == 409

@pytest.mark.anyio
async def test_update_service(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    data = {
        "has_alert_notification": True,
        "has_auto_publish": True
    }
    r = await client.patch(
        f"{settings.API_V1_STR}/services/{service_request.id}", 
        headers=superuser_token_headers,
        json=data
        )
    assert r.status_code == 200
    service_response = r.json()
    assert service_response["has_alert_notification"] == True
    assert service_response["has_auto_publish"] == True

@pytest.mark.anyio
async def test_update_service_non_superuser(
    client: AsyncClient, normal_user_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    data = {
        "has_alert_notification": True,
        "has_auto_publish": True
    }
    r = await client.patch(
        f"{settings.API_V1_STR}/services/{service_request.id}", 
        headers=normal_user_token_headers,
        json=data
        )
    assert r.status_code == 403

@pytest.mark.anyio
async def test_delete_service(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    r = await client.delete(
        f"{settings.API_V1_STR}/services/{service_request.id}", 
        headers=superuser_token_headers,
        )
    assert r.status_code == 200
    search_deleted = await Service.get_or_none(id=service_request.id)
    assert search_deleted == None

@pytest.mark.anyio
async def test_delete_service_non_superuser(
    client: AsyncClient, normal_user_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    r = await client.delete(
        f"{settings.API_V1_STR}/services/{service_request.id}", 
        headers=normal_user_token_headers,
        )
    assert r.status_code == 403

@pytest.mark.anyio
async def test_get_service_config(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    r = await client.get(
        f"{settings.API_V1_STR}/services/{service_request.id}/config", 
        headers=superuser_token_headers,
        )
    assert r.status_code == 200
    service_response = r.json()
    assert service_response["alert_config"] == None
    assert service_response["publish_config"] == None

@pytest.mark.anyio
async def test_update_service_alert_config(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    mail_to = ", ".join([random_email() for _ in range(3)])
    mail_cc = ", ".join([random_email() for _ in range(3)])
    recovery_mail_title = random_lower_string()

    data = {
        "mail_to": mail_to,
        "mail_cc": mail_cc,
        "recovery_mail_title": recovery_mail_title
    }
    r = await client.put(
        f"{settings.API_V1_STR}/services/{service_request.id}/config/alert", 
        headers=superuser_token_headers,
        json=data
        )
    assert r.status_code == 200
    service_created = await crud.get_or_404(
        Service, 
        id=service_request.id, 
        prefetch_related=["alert_config"]
    )
    assert service_created.alert_config.mail_to == mail_to
    assert service_created.alert_config.mail_cc == mail_cc
    assert service_created.alert_config.recovery_mail_title == recovery_mail_title
    assert service_created.alert_config.mail_from == None

@pytest.mark.anyio
async def test_update_service_publish_config(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    alert_publish_title = random_lower_string()
    show_influenced_user = True

    data = {
        "alert_publish_title": alert_publish_title,
        "show_influenced_user": show_influenced_user
    }
    r = await client.put(
        f"{settings.API_V1_STR}/services/{service_request.id}/config/publish", 
        headers=superuser_token_headers,
        json=data
        )
    assert r.status_code == 200
    service_created = await crud.get_or_404(
        Service, 
        id=service_request.id, 
        prefetch_related=["publish_config"]
    )
    assert service_created.publish_config.alert_publish_title == alert_publish_title
    assert service_created.publish_config.alert_publish_body == None
    assert service_created.publish_config.show_influenced_user == True

@pytest.mark.anyio
async def test_get_service_logs(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    service_request = await create_random_service()
    r = await client.get(
        f"{settings.API_V1_STR}/services/{service_request.id}/logs?skip={0}&limit={10}"
, 
        headers=superuser_token_headers,
        )
    assert r.status_code == 200
    service_response = r.json()
    service_response["logs"] == None
