from fastapi import APIRouter

from app.api.routes import login, utils, services, users, totp, websocket, user_services, file_transfer, firebase

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(totp.router)
api_router.include_router(users.router)
api_router.include_router(user_services.router)
api_router.include_router(services.router)
api_router.include_router(websocket.router)
api_router.include_router(file_transfer.router)
api_router.include_router(firebase.router)
api_router.include_router(utils.router)
