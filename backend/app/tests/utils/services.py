from app import crud
from app.core.config import settings
from app.models.db_models import UserDatabase, ServiceDatabase
from app.models.user_models import UserCreate
from app.tests.utils.utils import random_lower_string, random_email

async def create_random_service() -> ServiceDatabase:
    name = random_lower_string()
    sub_name = random_lower_string()
    service = await ServiceDatabase.create(name=name, sub_name=sub_name)
    return service