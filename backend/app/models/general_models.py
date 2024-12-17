from pydantic import BaseModel, Field

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

class QRUri(BaseModel):
    uri: str

class TOTPToken(BaseModel):
    token: str