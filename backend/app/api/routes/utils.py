from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic.networks import EmailStr

from app import crud
from app.api.dep import get_current_active_superuser, CurrentUser
from app.models.general_models import Message
from app.utils import generate_test_email, send_email

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post(
    "/test-email",
    dependencies=[Depends(get_current_active_superuser)]
)
async def test_email(email_to: EmailStr, current_user: CurrentUser) -> Message:
    """
    Test emails.
    """
    start = datetime.now()

    email_data = generate_test_email(email_to=email_to)
    response = await send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    log_data = {
        "start_time": start,
        "end_time": datetime.now(),
        "is_ok": True if response else False,
        "content": f"{response}, {current_user.username}",
    }
    await crud.add_log_entry(
        service_name="Sendgrid",
        service_sub_name="Mail API v3",
        log_data=log_data,
    )
    return Message(message="Test email sent")


@router.get("/health-check")
async def health_check() -> bool:
    return True