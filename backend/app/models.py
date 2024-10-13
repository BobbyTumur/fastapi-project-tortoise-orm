from typing import Any
from pydantic import BaseModel, Field, ConfigDict, EmailStr

from tortoise import fields
from tortoise.models import Model

class UserDatabase(Model):
    id = fields.IntField(primary_key=True)
    username = fields.CharField(max_length=255, null=True)
    email = fields.CharField(max_length=255, unique=True)
    hashed_password = fields.CharField(max_length=255)
    is_superuser = fields.BooleanField(default=False)
    is_active = fields.BooleanField(default=True)

    class Meta:
        table = "users"

class UserBase(BaseModel):
    username: str | None = Field(default=None, max_length=255)
    email: EmailStr = Field(max_length=255)
    is_superuser: bool = False
    is_active: bool = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)

class UserRegister(UserBase):
    pass

class UserPublic(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    
class UsersPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    data: list[UserPublic]
    count: int

class UpdatePassword(BaseModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)

class UserUpdate(BaseModel):
    username: str | None = Field(default=None, max_length=255)
    is_superuser: bool = False
    is_active: bool = True

class UserUpdateMe(BaseModel):
    username: str = Field(max_length=255)

# Generic message
class Message(BaseModel):
    message: str

class NewPassword(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayLoad(BaseModel):
    sub: str | None = None
    is_auth: bool = False