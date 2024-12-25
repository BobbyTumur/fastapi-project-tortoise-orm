import uuid
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, EmailStr, HttpUrl

class ServiceBase(BaseModel):
    name: str = Field(..., max_length=255)  # Unique and required
    sub_name: str = Field(..., max_length=255)  # Unique and required

class ServiceCreate(ServiceBase):
    pass

class ServicePublic(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID

class ServicesPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    data: list[ServicePublic]
    count: int

class ConfigBase(BaseModel):
    mail_from: Optional[EmailStr] = Field(None, max_length=255)  # Optional, email validation
    mail_cc: Optional[EmailStr] = Field(None, max_length=255)  # Optional, email validation
    mail_to: Optional[EmailStr] = Field(None, max_length=255)  # Optional, email validation
    alert_mail_title: Optional[str] = Field(None, max_length=255)  # Optional
    recovery_mail_title: Optional[str] = Field(None, max_length=255)  # Optional
    alert_mail_body: Optional[str] = None  # Optional
    recovery_mail_body: Optional[str] = None  # Optional
    slack_link: Optional[HttpUrl] = Field(None, max_length=255)  # Optional
    teams_link: Optional[HttpUrl] = Field(None, max_length=255)  # Optional

class ConfigIn(ConfigBase):
    pass

class ConfigOut(ConfigBase):
    model_config = ConfigDict(from_attributes=True)

class ServiceConfig(ServicePublic):
    config: Optional[ConfigOut]


