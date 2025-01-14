import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, EmailStr, HttpUrl, field_validator, TypeAdapter, ValidationError

class ServiceBase(BaseModel):
    name: str = Field(..., max_length=255)  # Unique and required
    sub_name: str = Field(..., max_length=255)  # Unique and required
    has_alert_notification: bool = False
    has_auto_publish: bool = False

class ServiceUpdate(BaseModel):
    has_alert_notification: bool = False
    has_auto_publish: bool = False

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
    has_extra_email: bool | None = False
    has_teams_slack: bool | None = False
    mail_from: EmailStr | None = Field(None, max_length=255)
    mail_cc: str | None = Field(None, max_length=255)
    mail_to: str | None = Field(None, max_length=255)
    alert_mail_title: str | None = Field(None, max_length=255)
    alert_mail_body: str | None = None
    recovery_mail_title: str | None = Field(None, max_length=255)
    recovery_mail_body: str | None = None
    extra_mail_to: str | None = Field(None, max_length=255)
    extra_mail_body: str | None = None
    slack_link: HttpUrl | None = Field(None, max_length=255)
    teams_link: HttpUrl | None = Field(None, max_length=255)


    # Validator to ensure values are valid email strings or empty
    @staticmethod
    def validate_email_list(emails: str) -> str:
        email_list = [email.strip() for email in emails.split(',')]
        email_validator = TypeAdapter(EmailStr)

        for email in email_list:
            try:
                email_validator.validate_python(email)
            except ValidationError as e:
                raise ValueError(f"Invalid email format: {email}") from e

        return emails

    @field_validator('mail_cc', 'mail_to', 'extra_mail_to')
    def validate_emails_or_empty(cls, v):
        if not v:
            return v  # Allow None or empty values
        return cls.validate_email_list(v)

class AlertConfigCreate(AlertConfigBase):
    pass
    
class AlertConfigPublic(AlertConfigBase):
    model_config = ConfigDict(from_attributes=True)


class PublishConfigBase(BaseModel):
    alert_publish_title: str | None = Field(None, max_length=255)  # Optional
    alert_publish_body: str | None = Field(None)  # Optional
    show_influenced_user: bool | None = False
    send_mail: bool | None = False

class PublishConfigCreate(PublishConfigBase):
    pass
class PublishConfigPublic(PublishConfigBase):
    model_config = ConfigDict(from_attributes=True)

class ServiceConfig(ServicePublic):
    alert_config: AlertConfigPublic | None 
    publish_config: PublishConfigPublic | None

class LogPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    start_time: datetime | None
    end_time: datetime | None
    elapsed_time: float | None = None
    is_ok: bool | None
    screenshot: str | None = None  # URL or path to the screenshot
    content: str | None = None  # Monitoring logs or messages

class ServiceLogs(ServicePublic):

    logs: list[LogPublic] | None