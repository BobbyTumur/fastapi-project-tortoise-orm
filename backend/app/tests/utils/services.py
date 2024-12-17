from app import crud
from app.core.config import settings
from app.models.db_models import User, Service
from app.models.user_models import UserCreate
from app.tests.utils.utils import random_lower_string, random_email

async def create_random_service() -> Service:
    name = random_lower_string()
    sub_name = random_lower_string()
    service = await Service.create(name=name, sub_name=sub_name)
    return service