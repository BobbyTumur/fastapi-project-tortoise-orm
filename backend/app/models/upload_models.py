from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class PromptURL(BaseModel):
    company_name: str
    expiry_minutes: int

class ResponseURL(BaseModel):
    url: str
    username: str
    password: str