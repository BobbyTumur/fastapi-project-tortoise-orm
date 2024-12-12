from fastapi import APIRouter

from app.api.routes import login, users, utils, services

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(services.router)
api_router.include_router(utils.router)
