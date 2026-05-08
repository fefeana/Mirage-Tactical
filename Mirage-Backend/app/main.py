from fastapi import FastAPI
import asyncio
from app.api.routes import router as api_router
from app.services.sentinel_core import mirage_core

app = FastAPI(
    title="Mirage Sentinel Unified System",
    description="Mirage VPN Control Server & Autonomous Kill Switch",
    version="2.0.0"
)

# تضمين مسارات الـ API
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    # تشغيل العين الذكية في الخلفية عند بدء تشغيل السيرفر
    asyncio.create_task(mirage_core.pulse_check())

@app.get("/")
def read_root():
    return {
        "status": "Mirage Gateway is Online", 
        "mode": "Samurai-Executive",
        "system": "Mirage Engine", 
        "message": "Samurai Core is active and awaiting commands."
    }
