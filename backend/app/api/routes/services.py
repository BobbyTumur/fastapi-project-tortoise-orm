from uuid import UUID

from tortoise.exceptions import IntegrityError
from fastapi import APIRouter, Depends, HTTPException

from app import crud, utils
from app.api.dep import CurrentUser, get_current_active_superuser
from app.models.db_models import Service
from app.models.user_models import UserPublic
from app.models.general_models import Message
from app.models.service_models import ServiceCreate, ServicePublic, ServicesPublic, AlertConfigCreate, ServiceConfig

router = APIRouter(prefix="/services", tags=["services"])

@router.get("/", response_model=ServicesPublic)
async def get_services(current_user: CurrentUser, skip: int = 0, limit: int = 100) -> ServicesPublic:
    """
    List all services
    """
    if current_user.is_superuser:
        services = await Service.all().offset(skip).limit(limit)
        count = await Service.all().count()
    else:
        services = await current_user.services.all().offset(skip).limit(limit)
        count = await current_user.services.all().count()
    return ServicesPublic(data=services, count=count)

@router.get("/{service_id}", response_model=ServicePublic)
async def get_service(current_user: CurrentUser, service_id: UUID) -> ServicePublic:
    """
    List a user that can edit the service
    """
    service = await crud.get_or_404(Service, id=service_id)
    is_associated = await current_user.services.filter(id=service_id).exists()
    if not current_user.is_superuser and not is_associated:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return service


@router.get("/{service_id}/users", response_model=list[UserPublic])
async def get_service_users(current_user: CurrentUser, service_id: UUID) -> list[UserPublic]:
    """
    List service users
    """
    service = await crud.get_or_404(Service, id=service_id, prefetch_related=["users"])
    is_associated = await current_user.services.filter(id=service_id).exists()
    if not current_user.is_superuser and not is_associated:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    # Only fetch who can edit
    users = await service.users.filter(can_edit=True).all()
    return users

@router.post("/", dependencies=[Depends(get_current_active_superuser)], response_model=Message)
async def create_service(service_in: ServiceCreate) -> Message:
    """
    Register a service
    """
    service_data = service_in.model_dump()
    try:
        await Service.create(**service_data)
        return Message(message="Successfully created a service")
    except IntegrityError:
        raise HTTPException(status_code=409, detail="The service already exists")
    
@router.delete("/{service_id}", dependencies=[Depends(get_current_active_superuser)], response_model=Message)
async def delete_service(service_id: UUID) -> Message:
    """
    Delete a service
    """
    service = await crud.get_or_404(Service, id=service_id, prefetch_related=["users"])
    if service:
        await service.delete()
    else:
        raise HTTPException(status_code=404, detail="Service not found")
    
@router.get("/{service_id}/config", response_model=ServiceConfig)
async def get_service_config(service_id: UUID, current_user: CurrentUser) -> ServiceConfig:
    """
    Read a service's config
    """
    service_with_config = await crud.get_or_404(Service, id=service_id, select_related=["alert_config", "publish_config"])
    is_associated = await current_user.services.filter(id=service_id).exists()
    if not current_user.is_superuser and not is_associated:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    # config = await Config.get_or_none(service=service)
    # if config is None:
    #     raise HTTPException(status_code=404, detail="No config yet for this service") 

    return ServiceConfig(
        **service_with_config.__dict__,
        alert_config=service_with_config.alert_config,
        publish_config=service_with_config.publish_config
    )

@router.patch("/{service_id}/config", response_model=Message)
async def update_service_config(service_id: UUID, config_in: AlertConfigCreate, current_user: CurrentUser) -> Message:
    """
    Register a service's config
    """
    service = await crud.get_or_404(Service, id=service_id, prefetch_related=["alert_config, publish_config"])
    # if not await utils.check_user_privileges(current_user, service_id):
    #     raise HTTPException(status_code=403, detail="Not enough privileges")
    await crud.create_or_update_config(service, config_in)
    return Message(message="Config updated successfully")
