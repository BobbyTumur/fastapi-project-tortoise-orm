from pydantic import BaseModel, Field, ConfigDict, EmailStr, model_validator

class UserBase(BaseModel):
    username: str = Field(max_length=255)
    email: EmailStr = Field(max_length=255)
    is_superuser: bool = False
    can_edit: bool = False
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
    username: str = Field(max_length=255)
    is_superuser: bool = False
    can_edit: bool = False
    is_active: bool = True


class UserUpdateServices(BaseModel):
    add_services: list[int] = Field(default_factory=list, description="List of service IDs to add")
    remove_services: list[int] = Field(default_factory=list, description="List of service IDs to remove")
    
    @model_validator(mode='before')
    def validate_services(cls, values):
        add_services = values.get("add_services", [])
        remove_services = values.get("remove_services", [])
        
        # Ensure no overlap between add and remove lists
        overlapping_ids = set(add_services) & set(remove_services)
        if overlapping_ids:
            raise ValueError(f"Conflicting service IDs in add_services and remove_services: {overlapping_ids}")
        
        return values

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


