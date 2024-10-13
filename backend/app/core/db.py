from fastapi import FastAPI

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from tortoise import Tortoise, generate_config
from tortoise.exceptions import DoesNotExist, IntegrityError
from tortoise.contrib.fastapi import RegisterTortoise

from app import crud
from app.core.config import settings
from app.models import UserDatabase, UserCreate

#Superuser creation
async def ensure_superuser_exists():
    try:
        await UserDatabase.get(email=settings.FIRST_SUPERUSER)
    except DoesNotExist:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        await crud.create_user(user_create=user_in)
    except IntegrityError:
        pass

#Test database set up
@asynccontextmanager
async def lifespan_test(app: FastAPI) -> AsyncGenerator[None, None]:
    config = generate_config(
        "sqlite://:memory:",
        app_modules={"models": ["app.models"]},
        testing=True,
        connection_label="models",
    )
    async with RegisterTortoise(
        app=app,
        config=config,
        generate_schemas=True,
        add_exception_handlers=True,
        _create_db=True,
    ):
        await ensure_superuser_exists()
        # db connected
        yield
        # app teardown
    # db connections closed
    await Tortoise._drop_databases()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    if getattr(app.state, "testing", None):
        async with lifespan_test(app) as _:
            yield
    else:
        # app startup
        await Tortoise.init(config=settings.TORTOISE_ORM)
        await ensure_superuser_exists()
        # Yield control back to FastAPI (app is running)
        yield

        # Teardown: Close DB connections
        await Tortoise.close_connections()