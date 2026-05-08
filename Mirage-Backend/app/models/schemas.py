from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ServerConfig(BaseModel):
    protocol: str
    port: int
    uuid: str
    network: str = "tcp"
    sni: Optional[str] = "www.microsoft.com"

class ServerCommand(BaseModel):
    server_ip: str
    action: str  # مثل: "restart", "change_protocol", "update_config"
    protocol: str = "vless"
    payload: Optional[dict] = None  # بيانات إضافية للتكوين

class TerminationResponse(BaseModel):
    status: str
    funds_transferred: float
    servers_affected: int
    data_wiped: bool
