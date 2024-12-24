import uuid
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, EmailStr

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
    email_from: Optional[EmailStr] = Field(None, max_length=255)  # Optional, email validation
    email_cc: Optional[EmailStr] = Field(None, max_length=255)  # Optional, email validation
    email_to: Optional[EmailStr] = Field(None, max_length=255)  # Optional, email validation
    alert_email_title: Optional[str] = Field(None, max_length=255)  # Optional
    recovery_email_title: Optional[str] = Field(None, max_length=255)  # Optional
    alert_email_body: Optional[str] = None  # Optional
    recovery_email_body: Optional[str] = None  # Optional
    slack_link: Optional[str] = Field(None, max_length=255)  # Optional
    teams_link: Optional[str] = Field(None, max_length=255)  # Optional

class ConfigIn(ConfigBase):
    pass

class ConfigOut(ConfigBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID

class ConfigsOut(ConfigBase):
    model_config = ConfigDict(from_attributes=True)

    data: list[ConfigOut]
    count: int

