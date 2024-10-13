from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.db import lifespan
from app.api.main import api_router
from app.core.config import settings

app = FastAPI(lifespan=lifespan)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


app.include_router(api_router, prefix=settings.API_V1_STR)
