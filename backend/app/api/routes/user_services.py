from fastapi import APIRouter, Depends

from app import crud
from app.api.dep import get_current_active_superuser
from app.models.db_models import User, Service
from app.models.service_models import ServicePublic
from app.models.user_models import UserUpdateServices
from app.models.general_models import Message


router = APIRouter(prefix="/users", tags=["users_services"])

@router.get("/{user_id}/services",
        dependencies=[Depends(get_current_active_superuser)],
        response_model=list[ServicePublic])
async def get_user_services(
    user_id: int,
) -> list[ServicePublic]:
    """
    Get user's services
    """
    user = await crud.get_or_404(User, id=user_id, prefetch_related=["services"])
    services = await user.services.all()
    return services

@router.patch("/{user_id}/services",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message
)
async def add_services_to_user(
    user_id: int,
    services_in: UserUpdateServices
) -> Message:
    """
    Add services to a user by IDs.
    """
    user = await crud.get_or_404(User, id=user_id, prefetch_related=["services"])
    # Process 'add_services'
    for service_id in services_in.added_services:
        service = await crud.get_or_404(Service, id=service_id)
    
    # Fetch current service IDs associated with the user
    current_service_ids = {service.id for service in await user.services.all()}
    
    # Determine services to add and remove
    new_service_ids = set(services_in.added_services)
    services_to_add = new_service_ids - current_service_ids
    services_to_remove = current_service_ids - new_service_ids

    # Add new services
    for service_id in services_to_add:
        service = await crud.get_or_404(Service, id=service_id)
        await user.services.add(service)

    # Remove old services
    for service_id in services_to_remove:
        service = await crud.get_or_404(Service, id=service_id)
        if service:  # No need to check existence; we already have the IDs
            await user.services.remove(service)

    return Message(message="User services updated successfully")