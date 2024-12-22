from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from tortoise.exceptions import DoesNotExist

from app.core import security
from app.core.config import settings
from app.models.db_models import User
from app.models.general_models import TokenPayLoad

resuasble_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")
TokenDep = Annotated[str, Depends(resuasble_oauth2)]

async def get_current_user(token: TokenDep, expect_totp: bool = False) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM], options={"verify_exp": True}
            )
        token_data = TokenPayLoad(**payload)

        if expect_totp and token_data.is_auth:
            raise HTTPException(status_code=401, detail="Invalid token type for TOTP")
        
        if not expect_totp and not token_data.is_auth:
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user = await User.get(id=token_data.sub)
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        
        return user
    
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    
CurrentUser = Annotated[User, Depends(get_current_user)]

async def get_totp_user(token: TokenDep) -> User:
    return await get_current_user(token, expect_totp=True)

CurrentTotpUser = Annotated[User, Depends(get_totp_user)]

def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user
