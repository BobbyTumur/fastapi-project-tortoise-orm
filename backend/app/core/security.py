import jwt, pyotp
from typing import Any
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


ALGORITHM = "HS256"


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject), "is_auth" : True}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_secret(plain_secret: str, hashed_secret: str) -> bool:
    return pwd_context.verify(plain_secret, hashed_secret)


def get_secret_hash(secret: str) -> str:
    return pwd_context.hash(secret)

def create_totp(username: str) -> tuple[str, str]:
    """
    Generate a TOTP secret and its provisioning URI for QR code generation.

    Args:
        username (str): Username for the TOTP URI.

    Returns:
        tuple[str, str]: A tuple containing the TOTP secret and the provisioning URI.
    """
    totp_secret = pyotp.random_base32()
    totp = pyotp.TOTP(totp_secret)
    qr_uri = totp.provisioning_uri(name=username, issuer_name=settings.PROJECT_NAME)
    return totp_secret, qr_uri

def verify_totp(*, totp: str, user_secret: str) -> bool:
    token = pyotp.TOTP(user_secret)
    return token.verify(totp)