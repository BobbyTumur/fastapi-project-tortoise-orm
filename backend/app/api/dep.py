from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Query, status
from fastapi.exceptions import WebSocketException
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from pydantic import ValidationError
from tortoise.exceptions import DoesNotExist

from app.core import security
from app.core.config import settings
from app.models.db_models import User
from app.models.general_models import TokenPayLoad

# Token dependency
reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")
TokenDep = Annotated[str, Depends(reusable_oauth2)]

async def get_current_user(token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[security.ALGORITHM],
            options={"verify_exp": True},  # Ensure expiration is verified
        )
        token_data = TokenPayLoad(**payload)
        user = await User.get(id=token_data.sub)
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        if user.is_totp_enabled and not token_data.totp_verified:
            raise HTTPException(status_code=401, detail="OTP validation required")
        return user

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Access token has expired.",
        )
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials.",
        )
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    
CurrentUser = Annotated[User, Depends(get_current_user)]

async def get_totp_user(token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM], options={"verify_exp": True}
            )
        token_data = TokenPayLoad(**payload)
        user = await User.get(id=token_data.sub)
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        if not user.is_totp_enabled:
            raise HTTPException(status_code=401, detail="OTP not set for the user")
        return user
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

TotpUser = Annotated[User, Depends(get_totp_user)]

def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user

async def get_socket_token(token: Annotated[str | None, Query()] = None) -> User:
    if token is None:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[security.ALGORITHM],
            options={"verify_exp": True},  # Ensure expiration is verified
        )
        token_data = TokenPayLoad(**payload)
        user = await User.get(id=token_data.sub)
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        if user.is_totp_enabled and not token_data.totp_verified:
            raise HTTPException(status_code=401, detail="OTP validation required")
        return user

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Access token has expired.",
        )
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials.",
        )
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")



SocketUser = Annotated[User, Depends(get_socket_token)]
