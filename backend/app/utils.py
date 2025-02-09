import logging, jwt, random, string
from datetime import timedelta, datetime, timezone
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal
from jinja2 import Template
from jwt.exceptions import InvalidTokenError
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from firebase_admin import messaging, exceptions

from app.core import security
from app.core.config import settings
from app.models.db_models import User
from app.models.db_models import FcmToken

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class EmailData:
    html_content: str
    subject: str


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent / "email-templates" / "build" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


async def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> str | None:
    assert settings.emails_enabled, "no provided configuration for email variables"
    message = Mail(
        from_email=settings.EMAILS_FROM_EMAIL,
        to_emails=email_to,
        subject=subject,
        html_content=html_content)
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code
    except Exception:
        return None


def generate_new_account_email(
    email_to: str, username: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": project_name,
            "username": username,
            "email": email_to,
            "link": settings.FRONTEND_HOST,
        },
    )
    return EmailData(html_content=html_content, subject=subject)

def generate_test_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": project_name, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)

def generate_resetup_password_email(*, email_to: str, email: str, token: str, action: Literal["reset", "setup"]) -> EmailData:
    project_name = settings.PROJECT_NAME
    if action == "reset":
        subject = f"{project_name} - Password recovery for user {email}"
        link = f"{settings.FRONTEND_HOST}/reset-password?token={token}"
        template = "reset_password.html"
        valid_time = settings.EMAIL_PASS_RESET_TOKEN_EXPIRE_MINUTES
    elif action == "setup":
        subject = f"{project_name} - Password set up for user {email}"
        link = f"{settings.FRONTEND_HOST}/setup-password?token={token}"
        template = "setup_password.html"
        valid_time = settings.EMAIL_PASS_SET_UP_TOKEN_EXPIRE_HOURS
    else:
        raise ValueError("Invalid action. Must be 'reset' or 'setup'.")

    html_content = render_email_template(
        template_name=template,
        context={
            "project_name": settings.PROJECT_NAME,
            "username": email,
            "email": email_to,
            "valid_time": valid_time,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)

def generate_utils_token(*, to_encode: str | Any, action: Literal["reset", "setup", "file_transfer"]) -> str:
    if action == "reset":
        delta = timedelta(minutes=settings.EMAIL_PASS_RESET_TOKEN_EXPIRE_MINUTES)
    elif action == "setup":
        delta = timedelta(hours=settings.EMAIL_PASS_SET_UP_TOKEN_EXPIRE_HOURS)
    elif action == "file_transfer":
        delta = timedelta(hours=settings.FILE_TRANSFER_TOKEN_EXPIRY_HOURS)
    else:
        raise ValueError("Invalid action. Must be 'reset' or 'setup' or 'file_transfer'.")

    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": str(to_encode)},
        settings.SECRET_KEY,
        algorithm=security.ALGORITHM,
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        if "totp_verified" in decoded_token:
            return None
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None
    

async def check_privileges(*, user: User, service_id: int, privilege: str = "read") -> bool:
    """
    Checks a user's privileges (read or write) for a specific service.

    Args:
        user (User): The current user object.
        service_id (int): The ID of the service to check privileges for.
        privilege (str): The type of privilege to check ("read" or "write").

    Returns:
        bool: True if the user has the specified privilege, False otherwise.

    Raises:
        ValueError: If an invalid privilege type is provided.
    """
    if privilege not in {"read", "write"}:
        raise ValueError("Invalid privilege type. Use 'read' or 'write'.")
    
    if user.is_superuser:
        # Superusers can access and edit all services
        return True
    
    # Check if the user is associated with the service
    is_associated = await user.services.filter(id=service_id).exists()
    if not is_associated:
        return False

    if privilege == "read":
        # Read privilege: User only needs to be associated
        return True

    if privilege == "write":
        # Write privilege: User must also have can_edit set to True
        return user.can_edit
    
    return False  # Default fallback


# 通知IDに使用するランドムジェネレーター
def generate_short_id(length: int = 6) -> str:
    """Generate a short, numeric ID."""
    return ''.join(random.choices(string.digits, k=length))

def create_message(id: str, registration_token: str, is_silent: bool) -> messaging.Message:
    common_data = {
        "notification_id": id,
        "body": "無音通知" if is_silent else "音付き通知",
    }
    if is_silent:
        return messaging.Message(
            data=common_data,
            token=registration_token,
            android=messaging.AndroidConfig(priority="high", ttl=3600),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(content_available=True)
                )
            ),
        )
    else:
        return messaging.Message(
            notification=messaging.Notification(
                title="正常生確認", body="サーバから通知されました。"
            ),
            token=registration_token,
            data=common_data,
        )

async def send_notif(id: str, registration_tokens: list, is_silent: bool = False):
    all_result = ""
    for registration_token in registration_tokens:
        try:
            message = create_message(id, registration_token, is_silent)
            messaging.send(message)
            all_result += f"Sent: {registration_token[:5]}"
        except Exception as e:
            all_result += f"Error: {registration_token[:5]}: {str(e)}"
    return all_result

