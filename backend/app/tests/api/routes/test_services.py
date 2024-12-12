import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock

from app import crud
from app.models.db_models import UserDatabase
from app.models.user_models import UserCreate
from app.core.config import settings
from app.core.security import verify_password
from app.tests.utils.services import create_random_service 
from app.tests.utils.utils import random_email, random_lower_string, random_integer



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