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

async def get_current_user(token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayLoad(**payload)
        if token_data.is_auth:
            user = await User.get(id=token_data.sub)
            if not user.is_active:
                raise HTTPException(status_code=400, detail="Inactive user")
            return user
        else:
            raise HTTPException(status_code=400, detail="Invalid token type")
    except (InvalidTokenError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    
    
CurrentUser = Annotated[User, Depends(get_current_user)]

def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user
