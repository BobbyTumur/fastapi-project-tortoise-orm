from fastapi import APIRouter, Depends, HTTPException

from app import crud
from app.api.dep import CurrentUser, get_current_active_superuser
from app.core.security import create_totp, get_secret_hash
from app.models.db_models import User
from app.models.general_models import QRUri, Message



router = APIRouter(prefix="/totp", tags=["totp"])

@router.get("/enable", response_model=QRUri)
async def enable_totp(current_user: CurrentUser) -> QRUri:
    """
    Creation of totp if totp not enabled
    """
    user = await crud.get_or_404(User, id=current_user.id)
    if user.is_totp_enabled:
        raise HTTPException(status_code=400, detail="TOTP is already enabled.")
    
    # Enable TOTP
    totp_secret, qr_uri = create_totp(user.username)
    totp_secret_hash = get_secret_hash(totp_secret)
    user.totp_secret = totp_secret_hash
    user.is_totp_enabled = True
    await user.save()

    return QRUri(uri=qr_uri)

@router.delete("/disable", response_model=Message)
async def disable_totp(current_user: CurrentUser) -> Message:
    """
    Disable TOTP for the current user.
    """
    user = await crud.get_or_404(User, id=current_user.id)
    if not user.is_totp_enabled:
        raise HTTPException(status_code=400, detail="TOTP is not enabled.")
    
    # Disable TOTP
    user.totp_secret = None
    user.is_totp_enabled = False
    await user.save()
    
    return Message(message="TOTP has been disabled successfully.")

@router.post(
        "/disable/{user_id}", 
        dependencies=[Depends(get_current_active_superuser)],
        response_model=Message
        )
async def admin_disable_totp(user_id: int) -> Message:
    """
    Disable TOTP for the certain user.
    """
    user = await crud.get_or_404(User, id=user_id)
    if not user.is_totp_enabled:
        raise HTTPException(status_code=400, detail="TOTP is not enabled.")
    
    # Disable TOTP
    user.totp_secret = None
    user.is_totp_enabled = False
    await user.save()
    
    return Message(message="TOTP has been disabled successfully for the user.")
