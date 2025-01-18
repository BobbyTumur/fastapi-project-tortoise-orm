import os
from uuid import UUID
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, field_validator

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class PromptUrl(BaseModel):
    company_name: str
    expiry_hours: int
    type: Literal["download", "upload"]
    file_name: str | None = None

class ResponseURL(BaseModel):
    url: str
    username: str
    password: str

class S3Object(BaseModel):
    Key: str
    LastModified: datetime
    Size: int

class Validated(BaseModel):
    validation: Literal["download", "upload"]

class DownloadUrl(BaseModel):
    url: str

class TempUserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    company_name: str
    file_name: str | None = None

    @field_validator("file_name", mode="before")
    def extract_file_name(cls, v):
        if v is None:
            return v
        return os.path.basename(v)