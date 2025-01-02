from fastapi import APIRouter

from app.api.routes import login, utils, services, users, totp, websocket
from app.api.routes import user_services

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(totp.router)
api_router.include_router(users.router)
api_router.include_router(user_services.router)
api_router.include_router(services.router)
api_router.include_router(websocket.router)
api_router.include_router(utils.router)
