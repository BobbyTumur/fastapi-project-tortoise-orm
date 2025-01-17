from typing import Literal
from pydantic import BaseModel
from datetime import datetime

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