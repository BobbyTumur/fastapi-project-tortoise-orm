from typing import Any, Optional, List
from fastapi import HTTPException
from pydantic import BaseModel
from tortoise.models import Model
from tortoise.queryset import QuerySet

from app.core.security import get_secret_hash
from app.models.db_models import User, Service, AlertConfig, PublishConfig
from app.models.user_models import UserCreate, UserUpdate
from app.models.service_models import AlertConfigCreate, PublishConfigCreate


async def create_user(*, user_create: UserCreate) -> User:
    user_data = user_create.model_dump()
    user_data['hashed_password'] = get_secret_hash(user_create.password)
    user = await User.create(**user_data)
    return user

async def update_instance(*, instance: Model, data_in: BaseModel) -> Model:
    update_data = data_in.model_dump(exclude_unset=True)
    instance.update_from_dict(update_data)
    await instance.save()
    return instance

async def get_or_404(
    model: Model,
    prefetch_related: list[str] | None = None,
    select_related: list[str] | None = None,
    **filters: Any
) -> Model:
    """
    Retrieve an object from the database with optional prefetch_related and select_related.
    Raises 404 HTTPException if not found.

    Args:
        model: Tortoise model class.
        prefetch_related: Optional list of related fields to prefetch.
        select_related: Optional list of related fields to select.
        filters: Filters to apply for the query.

    Returns:
        Model instance if found.

    Raises:
        HTTPException: If the object is not found.
    """
    # Start with a base query
    query: QuerySet = model.filter(**filters)
    
    # Apply prefetch_related if provided
    if prefetch_related:
        query = query.prefetch_related(*prefetch_related)

    if select_related:
        query = query.select_related(*select_related)

    # Execute query
    obj = await query.first()
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")

    return obj


async def create_or_update_config(service: Service, config_data: AlertConfigCreate | PublishConfigCreate):
    """
    Create or update the configuration for a given service.
    """
    database = AlertConfig if isinstance(config_data, AlertConfigCreate) else PublishConfig
    config_dict = config_data.model_dump(exclude_unset=True)

    for field in config_data.model_fields:  # Loop through all fields in the model
        if field not in config_dict:  # If the field is not in the config_dict
            config_dict[field] = None 
            
    instance, created = await database.get_or_create(
        service=service,
        defaults=config_dict,
    )
    
    if not created:
        # Update the existing config with new data
        await instance.update_from_dict(config_dict)
        await instance.save()
    
    return instance