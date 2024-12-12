from fastapi import APIRouter, Depends
from pydantic.networks import EmailStr

from app.api.dep import get_current_active_superuser
from app.models.user_models import Message
from app.utils import generate_test_email, send_email

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post(
    "/test-email",
    dependencies=[Depends(get_current_active_superuser)]
)
async def test_email(email_to: EmailStr) -> Message:
    """
    Test emails.
    """
    email_data = generate_test_email(email_to=email_to)
    await send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


@router.get("/health-check")
async def health_check() -> bool:
    return True