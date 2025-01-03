import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from asgi_lifespan import LifespanManager
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from unittest.mock import Mock

from app.main import app 
from app.core.config import settings
from app.tests.utils.user import get_superuser_token_headers, get_normal_user_token_headers

ClientManagerType = AsyncGenerator[AsyncClient, None]


@pytest.fixture(scope="module")
def anyio_backend() -> str:
    return "asyncio"


@asynccontextmanager
async def client_manager(app: FastAPI, base_url="http://testserver", **kw) -> ClientManagerType:
    app.state.testing = True
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url=base_url, **kw) as c:
            yield c


@pytest.fixture(scope="module")
async def client() -> ClientManagerType:
    async with client_manager(app) as c:
        yield c

@pytest.fixture(scope="module")
async def superuser_token_headers(client: AsyncClient) -> dict[str, str]:
    return await get_superuser_token_headers(client)

@pytest.fixture(scope="module")
async def normal_user_token_headers(client: AsyncClient) -> dict[str, str]:
    return await get_normal_user_token_headers(client, settings.EMAIL_TEST_USER)