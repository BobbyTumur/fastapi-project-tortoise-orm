import secrets
from typing import Annotated, Any, Literal

from pydantic import BeforeValidator, computed_field, AnyUrl, EmailStr
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env", env_ignore_empty=True, extra="ignore"
    )
    PROJECT_NAME: str = "Change this"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(64)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Minutes
    REFRESH_TOKEN_EXPIRE_HOURS: int = 1  # Hours
    UPLOAD_TOKEN_EXPIRY_HOURS: int = 9 # Hours
    FRONTEND_HOST: str = "http://localhost:5173"
    ENVIRONMENT: Literal["testing", "local", "staging", "production"] = "testing"

    OPENAI_API_KEY: str | None = None
    CIPHER_KEY: str | None = None
    S3_BUCKET_NAME: str | None = None

    @computed_field
    @property
    def BASE_URL(self) -> AnyUrl | None:
        return f"{self.FRONTEND_HOST}/validate"

    
    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.FRONTEND_HOST
        ]    
    
    MYSQL_USER: str | None = None
    MYSQL_PASSWORD: str | None = None
    MYSQL_SERVER: str | None = None
    MYSQL_DB: str | None = None
    MYSQL_PORT: int = 3306
    
    @computed_field  # type: ignore[prop-decorator]
    @property
    def MYSQL_DATABASE_URI(self) -> AnyUrl | None:
        if self.ENVIRONMENT != "testing":
            return MultiHostUrl.build(
                scheme="mysql",
                username=self.MYSQL_USER,
                password=self.MYSQL_PASSWORD,
                host=self.MYSQL_SERVER,
                port=self.MYSQL_PORT,
                path=self.MYSQL_DB,
            )
        return None
    
    @property
    def TORTOISE_ORM(self) -> dict:
        return {
            "connections": {
                "default": str(self.MYSQL_DATABASE_URI),
            },
            "apps": {
                "models": {
                    "models": ["app.models.db_models", "aerich.models"],
                    "default_connection": "default",
                },
            },
        }
    FIRST_USER_NAME: str = "Maintainer"
    FIRST_SUPERUSER: EmailStr = "super_user@example.com"
    FIRST_SUPERUSER_PASSWORD: str = secrets.token_urlsafe(8)

    EMAILS_FROM_EMAIL: EmailStr | None = None
    EMAIL_TEST_USER: EmailStr = "test@example.com"

    EMAIL_PASS_SET_UP_TOKEN_EXPIRE_HOURS: int = 24
    EMAIL_PASS_RESET_TOKEN_EXPIRE_MINUTES: int = 30
    SENDGRID_API_KEY: str | None = None


    @computed_field  # type: ignore[prop-decorator]
    @property
    def emails_enabled(self) -> bool:
        return bool(self.SENDGRID_API_KEY and self.EMAILS_FROM_EMAIL)

settings = Settings()
tortoise_orm = settings.TORTOISE_ORM