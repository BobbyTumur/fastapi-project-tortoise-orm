from fastapi import FastAPI

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from tortoise import Tortoise
from tortoise.exceptions import DoesNotExist, IntegrityError
from tortoise.contrib.fastapi import RegisterTortoise

from app import crud
from app.core.config import settings
from app.models.db_models import UserDatabase
from app.models.user_models import UserCreate


#Superuser creation
async def ensure_superuser_exists():
    try:
        await UserDatabase.get(email=settings.FIRST_SUPERUSER)
    except DoesNotExist:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            username=settings.FIRST_USER_NAME,
            is_superuser=True,
        )
        await crud.create_user(user_create=user_in)
    except IntegrityError:
        pass

#Test database set up
@asynccontextmanager
async def lifespan_test(app: FastAPI) -> AsyncGenerator[None, None]:
    async with RegisterTortoise(
        app=app,
        config = {
                    "connections": {
                        "default": "sqlite://:memory:",  
                    },
                    "apps": {
                        "models": {
                            "models": ["app.models.db_models"],
                            "default_connection": "default",
                        },
                    },
                },
        add_exception_handlers=True,
        generate_schemas=True
    ):
        await ensure_superuser_exists()
        yield
    await Tortoise._drop_databases()

# @asynccontextmanager
# async def lifespan_local(app: FastAPI) -> AsyncGenerator[None, None]:
#     async with RegisterTortoise(
#         app=app,
#         config = {
#                     "connections": {
#                         "internal": "sqlite://:memory:",  
#                         "external": "mysql://root:443300443300@0.0.0.0:3306/kanekog",
#                     },
#                     "apps": {
#                         "models": {
#                             "models": ["app.models.models"],
#                             "default_connection": "internal",
#                         },
#                         "external_models": {
#                             "models": ["app.models.external_model"],
#                             "default_connection": "external",
#                         },
#                     },
#                 },
#         add_exception_handlers=True,
#         generate_schemas=True
#     ):
#         await ensure_superuser_exists()
#         # db connected
#         yield
#         # app teardown



@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    if getattr(app.state, "testing", None):
        async with lifespan_test(app) as _:
            yield
    # elif settings.ENVIRONMENT == "local":
    #     async with lifespan_local(app) as _:
    #         yield
    else:
        # app startup
        await Tortoise.init(config=settings.TORTOISE_ORM)
        await ensure_superuser_exists()
        # Yield control back to FastAPI (app is running)
        yield

        # Teardown: Close DB connections
        await Tortoise.close_connections()