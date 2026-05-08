from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from app.models.schemas import Token, ServerConfig, ServerCommand, TerminationResponse
from app.core.security import create_access_token, verify_password, get_password_hash, get_api_key
from app.services.xray_core import XrayManager
from app.services.cloud_manager import CloudManager
from app.services.sentinel_core import mirage_core

router = APIRouter()
xray_manager = XrayManager()
cloud_manager = CloudManager()

# قاعدة بيانات وهمية مؤقتة (للتجربة)
fake_users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": get_password_hash("mirage2026"),
    }
}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user_dict = fake_users_db.get(form_data.username)
    if not user_dict or not verify_password(form_data.password, user_dict["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user_dict["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/server/deploy")
async def deploy_server(config: ServerConfig):
    """
    نقطة نهاية لنشر إعدادات الخادم (VLESS/Hysteria2)
    """
    try:
        result = xray_manager.generate_config(config)
        return {"status": "success", "message": "Server configuration deployed", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/server/status")
async def server_status():
    """
    التحقق من حالة محرك Mirage (Xray)
    """
    status = xray_manager.check_status()
    return {"status": status, "engine": "Xray-core"}

@router.post("/execute-command")
async def execute_command(command: ServerCommand, api_key: str = Depends(get_api_key)):
    """
    بوابة التحكم بالسيرفرات السحابية (Google Compute Engine / Hetzner)
    محمية بمفتاح X-Admin-Sentinel-Key
    """
    # هنا يتم الربط مع السيرفرات السحابية
    # سنقوم بترجمة الأوامر إلى تعليمات برمجية
    print(f"Executing {command.action} on {command.server_ip} using {command.protocol}")
    
    try:
        # تنفيذ الأمر عبر مدير السحابة
        result = cloud_manager.execute_remote_command(
            server_ip=command.server_ip,
            action=command.action,
            protocol=command.protocol,
            payload=command.payload
        )
        
        return {
            "message": f"Command {command.action} sent successfully",
            "target": command.server_ip,
            "status": "Processing",
            "cloud_response": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloud execution failed: {str(e)}")

@router.post("/admin/kill-switch")
async def admin_kill_switch(api_key: str = Depends(get_api_key)):
    """
    هذا الأمر يستدعيه الـ AI أو أنت من اللوحة في حالة الطوارئ
    محمي بمفتاح X-Admin-Sentinel-Key
    """
    result = await mirage_core.trigger_total_wipe()
    return result

@router.get("/admin/status")
async def get_system_status(api_key: str = Depends(get_api_key)):
    """
    لعرض تقرير حي في نافذة الدردشة بينك وبين الـ AI
    محمي بمفتاح X-Admin-Sentinel-Key
    """
    return {
        "time": datetime.now(),
        "active_servers": len(mirage_core.servers),
        "monitoring": mirage_core.is_monitoring,
        "security_level": "MAXIMUM"
    }
