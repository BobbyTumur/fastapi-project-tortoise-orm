from app.core.security import get_password_hash
from app.models.db_models import UserDatabase, ServiceDatabase, ServiceLogs, ServiceConfigs
from app.models.user_models import UserCreate, UserUpdate
from app.models.service_models import ConfigIn


async def create_user(*, user_create: UserCreate) -> UserDatabase:
    user_data = user_create.model_dump()
    user_data['hashed_password'] = get_password_hash(user_create.password)
    user = await UserDatabase.create(**user_data)
    return user

async def update_user(*, db_user: UserDatabase, user_in: UserUpdate) -> UserDatabase:
    update_data = user_in.model_dump(exclude_unset=True)
    db_user.update_from_dict(update_data)
    await db_user.save()
    return db_user

async def create_or_update_config(service: ServiceDatabase, config_data: ConfigIn):
    """
    Create or update the configuration for a given service.
    """
    config_dict = config_data.model_dump(exclude_unset=True)
    config, created = await ServiceConfigs.get_or_create(
        service=service,
        defaults=config_dict,
    )
    
    if not created:
        # Update the existing config with new data
        await config.update_from_dict(config_dict)
        await config.save()
    
    return config