import aioredis, firebase_admin
from fastapi import FastAPI
from firebase_admin import credentials
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from tortoise import Tortoise
from tortoise.exceptions import IntegrityError
from tortoise.contrib.fastapi import RegisterTortoise

from app import crud
from app.core.config import settings
from app.models.db_models import User
from app.models.user_models import UserCreate


#Superuser creation
async def ensure_superuser_exists():
    try:
        user = await User.get_or_none(email=settings.FIRST_SUPERUSER)
        if user is None:
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

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    if getattr(app.state, "testing", None):
        async with lifespan_test(app) as _:
            yield
    else:
        # app startup
        cred = credentials.Certificate("firebase-admin-sdk.json")
        firebase_admin.initialize_app(cred)
        await Tortoise.init(config=settings.TORTOISE_ORM)
        await ensure_superuser_exists()
        # app.state.redis = aioredis.from_url(
        #     settings.REDIS_DATABASE_URI, 
        #     encoding="utf-8", 
        #     decode_responce=True)
        try:
            yield
        finally:
            # Close Redis
            # if app.state.redis:
            #     await app.state.redis.close()
            # Close Tortoise connections
            await Tortoise.close_connections()