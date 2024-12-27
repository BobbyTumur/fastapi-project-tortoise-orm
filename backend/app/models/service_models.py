import uuid
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, EmailStr, HttpUrl

class ServiceBase(BaseModel):
    name: str = Field(..., max_length=255)  # Unique and required
    sub_name: str = Field(..., max_length=255)  # Unique and required
    has_extra_email: bool = False
    has_teams_slack: bool = False

class ServiceCreate(ServiceBase):
    pass

class ServicePublic(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID

class ServicesPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    data: list[ServicePublic]
    count: int

class AlertConfigBase(BaseModel):
    mail_from: Optional[EmailStr] = Field(None, max_length=255)  # Optional
    mail_cc: Optional[List[EmailStr]] = Field(None, max_length=255)  # Optional list of EmailStr
    mail_to: Optional[List[EmailStr]] = Field(None, max_length=255)  # Optional list of EmailStr
    alert_mail_title: Optional[str] = Field(None, max_length=255)  # Optional
    alert_mail_body: Optional[str] = None  # Optional
    recovery_mail_title: Optional[str] = Field(None, max_length=255)  # Optional
    recovery_mail_body: Optional[str] = None  # Optional
    extra_mail_to: Optional[List[EmailStr]] = Field(None, max_length=255)  # Optional
    extra_mail_body: Optional[str] = None  # Optional
    slack_link: Optional[HttpUrl] = Field(None, max_length=255)  # Optional
    teams_link: Optional[HttpUrl] = Field(None, max_length=255)  # Optional

class PublishConfigBase(BaseModel):
    alert_publish_title: Optional[str] = Field(None, max_length=255)  # Optional
    alert_publish_body: Optional[str] = Field(None)  # Optional
    influenced_user: bool = False
    send_mail: bool = True

class AlertConfigCreate(AlertConfigBase):
    pass
    
class PublishConfigCreate(PublishConfigBase):
    pass

class AlertConfigPublic(AlertConfigBase):
    model_config = ConfigDict(from_attributes=True)

class PublishConfigPublic(PublishConfigBase):
    model_config = ConfigDict(from_attributes=True)

class ServiceConfig(ServicePublic):
    alert_config: Optional[AlertConfigPublic]
    publish_config: Optional[PublishConfigPublic]

