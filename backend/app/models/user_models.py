from pydantic import BaseModel, Field, ConfigDict, EmailStr

class UserBase(BaseModel):
    username: str = Field(max_length=255)
    email: EmailStr = Field(max_length=255)
    is_superuser: bool = False
    can_edit: bool = False
    is_active: bool = True
    is_totp_enabled: bool = False

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
    username: str = Field(max_length=255)
    is_superuser: bool = False
    can_edit: bool = False
    is_active: bool = True


class UserUpdateServices(BaseModel):
    added_services: list[int] = Field(default_factory=list)

# Generic message

