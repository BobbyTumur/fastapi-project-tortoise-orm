from pydantic import BaseModel, ConfigDict, Field


class TokenBase(BaseModel):
    token: str = Field(max_length=255)

class TokenIn(TokenBase):
    pass

class TokenOut(TokenBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int

class TokensOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    data: list[TokenOut]
    count: int

class MessageFromClient(BaseModel):
    token: str = Field(min_length=30)
    os: str
    notification_id: str  # Add notification ID field for comparison
    is_silent: bool
