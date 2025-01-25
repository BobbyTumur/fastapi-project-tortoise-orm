from datetime import datetime
from fastapi import APIRouter, Depends

from app import crud
from app.models.db_models import FcmToken
from app.models.general_models import Message
from app.models.firebase import TokenIn, TokensOut, MessageFromClient
from app.utils import send_notif, generate_short_id
from app.api.dep import get_current_user, CurrentUser

router = APIRouter(prefix="/firebase", tags=["firebase"])

# # Timeout in second
# TIMEOUT = 30

# 正常性確認ルート
@router.get(
    "/all", 
    dependencies=[Depends(get_current_user)],
    response_model=Message, 
    )
async def health_check() -> Message:
    tokens = [token.token async for token in FcmToken.all()]
    notification_id = generate_short_id()
    response = await send_notif(id=notification_id, registration_tokens=tokens, is_silent=False)
    return Message(message=response)

# スマホのボタンの正常性確認
@router.get(
    "/my-health", 
    response_model=Message, 
)
async def health_check_phone(current_user: CurrentUser) -> Message:
    token = await crud.get_or_404(FcmToken, user_id=current_user)
    
    start = datetime.now()
    notification_id = generate_short_id()

    response = await send_notif(
        id=notification_id, 
        registration_tokens=[token.token], 
        is_silent=False
        )
    log_data = {
        "start_time": start,
        "end_time": datetime.now(),
        "is_ok": True if response.startswith("Sent") else False,
        "content": f"{response}, {current_user.username}",
    }
    await crud.add_log_entry(
        service_name="Firebase",
        service_sub_name="Cloud Messaging",
        log_data=log_data,
    )
    return Message(message=response)

# スマホが通知受けたら、承認するAPI
@router.post(
    "/reply", 
    dependencies=[Depends(get_current_user)], 
    response_model=Message, 
)
async def receive_message(msg: MessageFromClient) -> Message:
    # if msg.is_silent:
        
    #     notification_key = f"notification:{msg.notification_id}"

    #     if not await redis.exists(notification_key):
    #         raise HTTPException(status_code=400, detail="通知IDに誤りがあります。")
        
    #     device_entry = f'{msg.token[:5]}...{msg.token[-5:]: {msg.os}}'
    #     async with redis.pipeline(transaction=True) as pipe:
    #         await (
    #             pipe.sadd(f"{notification_key}:devices", device_entry)
    #             .sadd(f"{notification_key}:os_types", msg.os)
    #             .execute()
    #         )
    #     # Check if the required conditions are met (e.g., both iOS and Android responded)
    #     os_types = await redis.smembers(f"{notification_key}:os_types")
    #     if b"Android" in os_types:  # Modify this condition as per your requirements
    #         # Signal the event by setting a key in Redis
    #         await redis.set(f"{notification_key}:terminate_event", 1)

    return Message(message="サーバが承認しました。")

# サーバで定期的に通知を飛ばすAPI
# @router.get(
#     "/check-firebase", 
#     dependencies=[Depends(get_current_user)], 
# )
# async def check_firebase(redis: RedisClient) -> Any:
#     start_time = datetime.now()
#     notification_id = generate_short_id()
#     notification_key = f"notification:{notification_id}"

#     # Initialize Redis keys
#     async with redis.pipeline(transaction=True) as pipe:
#         await (
#             pipe.set(f"{notification_key}:terminate_event", 0)
#             .delete(f"{notification_key}:devices", f"{notification_key}:os_types")
#             .expire(notification_key, TIMEOUT + 10)
#             .execute()
#         )

#     tokens = [token.token async for token in FcmToken.all()] # TODO to change to only device that is meant for monitoring
#     log_on_send = await send_notif(
#         id=notification_id,
#         registration_tokens=tokens,
#         is_silent=True,
#     )

#     # Wait for the terminate event or timeout
#     try:
#         for _ in range(settings.TIMEOUT):
#             terminate_event = await redis.get(f"{notification_key}:terminate_event")
#             if terminate_event == b"1":
#                 break
#             await asyncio.sleep(1)

#         devices = await redis.smembers(f"{notification_key}:devices")
#         log_on_receive = (
#             f"[受信:通知ID {notification_id}] [即時終了: AndroidおよびiOS端末からの応答] "
#             f"[応答端末: {', '.join(device.decode() for device in devices)}]"
#         )
#         end_time = datetime.now()
#     except asyncio.TimeoutError:
#         log_on_receive = f"[通知ID {notification_id}] [タイムアウト]"

#     return {"start_time": start_time, "end_time": end_time, "log": log_on_receive}
    
@router.get(
    "/tokens", 
    dependencies=[Depends(get_current_user)],
    response_model=TokensOut, 
    )
async def get_tokens() -> TokensOut:
    tokens = await FcmToken.all()
    count = await FcmToken.all().count()
    return TokensOut(data=tokens, count=count)
    

@router.post(
    "/register-token", 
    response_model=Message, 
    )
async def register_token(token_in: TokenIn, current_user: CurrentUser) -> Message:
    fcm_token, created = await FcmToken.update_or_create(
        user_id=current_user,
        defaults={"token": token_in.token}
    )
    return Message(message=f'FCM token {"registered" if created else "updated"} successfully.')