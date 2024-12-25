import jwt, pyotp
from typing import Any
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


ALGORITHM = "HS256"


def create_access_token(subject: str | Any, expires_delta: timedelta, totp_verified: bool) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=1) if settings.ENVIRONMENT == "local" else datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject), "totp_verified" : totp_verified}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(subject: str | Any) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_HOURS)
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def decode_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": True})
    except jwt.ExpiredSignatureError:
        raise Exception("Token has expired")
    except jwt.JWTError:
        raise Exception("Invalid token")

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