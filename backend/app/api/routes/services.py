from uuid import UUID

from tortoise.exceptions import IntegrityError
from fastapi import APIRouter, Depends, HTTPException

from app import crud, utils
from app.api.dep import CurrentUser, get_current_active_superuser
from app.models.db_models import Service, User, Log
from app.models.user_models import Usernames
from app.models.general_models import Message
from app.models.service_models import ServiceCreate, ServiceUpdate, ServicePublic, ServicesPublic, AlertConfigCreate, PublishConfigCreate, ServiceConfig, ServiceLogs

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
    can_read = await utils.check_privileges(
        user=current_user, 
        service_id=service_id, 
        privilege="read"
        )
    if not can_read:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return service

@router.get("/{service_id}/users", response_model=Usernames)
async def get_service_users(current_user: CurrentUser, service_id: UUID) -> Usernames:
    """
    List service users
    """
    service = await crud.get_or_404(
        Service, 
        id=service_id, 
        prefetch_related=["users"]
        )
    can_read = await utils.check_privileges(
        user=current_user, 
        service_id=service_id, 
        privilege="read"
        )
    if not can_read:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    # Only fetch who can edit
    users = await service.users.filter(can_edit=True).all() + await User.filter(is_superuser=True).all()
    usernames = [user.username for user in users]
    return Usernames(usernames=usernames)

@router.post(
        "/", 
        dependencies=[Depends(get_current_active_superuser)], 
        response_model=ServicePublic
        )
async def create_service(service_in: ServiceCreate) -> ServicePublic:
    """
    Register a service
    """
    service_data = service_in.model_dump()
    try:
        service = await Service.create(**service_data)
        return service
    except IntegrityError:
        raise HTTPException(status_code=409, detail="The service already exists")
    
@router.patch("/{service_id}", response_model=ServicePublic)
async def update_service(
    service_id: UUID, service_in: ServiceUpdate, current_user: CurrentUser) -> ServicePublic:
    """
    Update a service
    """
    service = await crud.get_or_404(model=Service, id=service_id)

    can_write = await utils.check_privileges(
        user=current_user, 
        service_id=service_id, 
        privilege="write"
        )
    if not can_write:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    service = await crud.update_instance(instance=service, data_in=service_in)

    return service
    
@router.delete(
        "/{service_id}", 
        dependencies=[Depends(get_current_active_superuser)], 
        response_model=Message
        )
async def delete_service(service_id: UUID) -> Message:
    """
    Delete a service
    """
    service = await crud.get_or_404(
        Service, 
        id=service_id, 
        prefetch_related=["users"])

    await service.delete()
    
    return Message(message="Successfully deleted the service.")
    
@router.get("/{service_id}/config", response_model=ServiceConfig)
async def get_service_config(service_id: UUID, current_user: CurrentUser) -> ServiceConfig:
    """
    Read a service's config
    """
    service_with_config = await crud.get_or_404(
        Service, 
        id=service_id, 
        select_related=["alert_config", "publish_config"]
        )

    can_read = await utils.check_privileges(
        user=current_user, 
        service_id=service_id, 
        privilege="read"
        )
    if not can_read:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    return ServiceConfig(
        **service_with_config.__dict__,
        alert_config=service_with_config.alert_config,
        publish_config=service_with_config.publish_config
    )

@router.put("/{service_id}/config/alert", response_model=Message)
async def update_service_alert_config(
    service_id: UUID, 
    config_in: AlertConfigCreate, 
    current_user: CurrentUser
    ) -> Message:
    """
    Update service's config (Alert)
    """
    service = await crud.get_or_404(
        Service, 
        id=service_id, 
        prefetch_related=["alert_config"]
        )

    can_write = await utils.check_privileges(
        user=current_user, 
        service_id=service_id, 
        privilege="write")
    if not can_write:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    await crud.create_or_update_config(service=service, config_data=config_in)
    return Message(message="Alert config updated successfully")

@router.put("/{service_id}/config/publish", response_model=Message)
async def update_service_publish_config(
    service_id: UUID, 
    config_in: PublishConfigCreate, 
    current_user: CurrentUser
    ) -> Message:
    """
    Update service's config (Alert)
    """
    service = await crud.get_or_404(
        Service, 
        id=service_id, 
        prefetch_related=["publish_config"]
        )

    can_write = await utils.check_privileges(
        user=current_user, 
        service_id=service_id, 
        privilege="write")
    if not can_write:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    await crud.create_or_update_config(service=service, config_data=config_in)
    return Message(message="Alert config updated successfully")

@router.get(
        "/{service_id}/logs", 
        response_model=ServiceLogs
        )
async def get_service_logs(
    current_user: CurrentUser, 
    service_id: UUID, 
    skip: int = 0, 
    limit: int = 100):
    """
    Retrieve logs for a specific service.
    """
    service = await crud.get_or_404(
        Service, 
        id=service_id, 
        prefetch_related=["logs"]
        )
    
    can_read = await utils.check_privileges(
        user=current_user,
        service_id=service_id,
        privilege="read"
    )
    if not can_read:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    # Apply skip and limit manually (as get_or_404 retrieves a single instance by default)
    logs_data = await Log.filter(service_id=service_id).offset(skip).limit(limit).all()
    # if not logs_data:
    #     raise HTTPException(status_code=404, detail="No logs found for this service.")
    return ServiceLogs(**service.__dict__, logs=logs_data)