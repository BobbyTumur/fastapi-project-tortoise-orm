import logging
from datetime import timedelta, datetime, timezone
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal



import jwt
from jinja2 import Template
from jwt.exceptions import InvalidTokenError
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from fastapi import HTTPException

from app.core import security
from app.core.config import settings
from app.models.db_models import User

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
        return response
    except Exception as e:
        return None


def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "password": password,
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
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
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
        template = "set_up_password.html"
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

def generate_email_token(*, email_to_encode: str, action: Literal["reset", "setup"]) -> str:
    if action == "reset":
        delta = timedelta(minutes=settings.EMAIL_PASS_RESET_TOKEN_EXPIRE_MINUTES)
    elif action == "setup":
        delta = timedelta(hours=settings.EMAIL_PASS_SET_UP_TOKEN_EXPIRE_HOURS)
    else:
        raise ValueError("Invalid action. Must be 'reset' or 'setup'.")

    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email_to_encode},
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


async def check_user_privileges(user: User, service_id: int) -> bool:
    """
    Checks a user's privileges for a specific service.

    Args:
        user (User): The current user object.
        service_id (int): The ID of the service to check privileges for.

    Raises:
        HTTPException: If the user lacks sufficient privileges.
    """
    if user.is_superuser:
        # Superusers can access and edit all services
        return
    
    if user.can_edit:
        # Tier 2: Check if the user is associated with the service
        is_associated = await user.services.filter(id=service_id).exists()
        if not is_associated:
            return False
        return True
    
    # Tier 1: Users who cannot edit are not authorized
    return False