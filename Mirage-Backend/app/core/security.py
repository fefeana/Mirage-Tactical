from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from cryptography.fernet import Fernet
from starlette.status import HTTP_403_FORBIDDEN
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "MIRAGE_DEFAULT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- طبقة الأمان الخاصة بالـ Sentinel (Kill Switch & Gateway) ---
API_KEY_NAME = "X-Admin-Sentinel-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_decrypted_master_key():
    """
    سحب المفتاح المشفر من البيئة وفك تشفيره باستخدام مفتاح التشفير الرئيسي.
    """
    try:
        # مفتاح التشفير (الذي يفك القفل) - يجب أن يكون مخزناً في Secret Manager
        encryption_key = os.getenv("MIRAGE_ENCRYPTION_KEY")
        # المفتاح النهائي المشفر (الذي نقارنه بطلبات المستخدم)
        encrypted_sentinel_key = os.getenv("ENCRYPTED_SENTINEL_KEY")

        if not encryption_key or not encrypted_sentinel_key:
            raise ValueError("Missing Security Environment Variables")

        cipher_suite = Fernet(encryption_key.encode())
        decrypted_key = cipher_suite.decrypt(encrypted_sentinel_key.encode())
        
        return decrypted_key.decode()
    except Exception as e:
        # في حال حدوث خطأ في التشفير، لا نكشف السبب الحقيقي للأمان
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Security Engine Failure"
        )

async def get_api_key(api_key: str = Security(api_key_header)):
    """
    الاعتمادية (Dependency) التي تحمي المسارات.
    تقارن المفتاح القادم من Header بالمفتاح المفكوك تشفيره.
    """
    if not api_key:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, 
            detail="API Key missing"
        )

    # فك تشفير المفتاح المخزن للمقارنة
    actual_master_key = get_decrypted_master_key()

    if api_key != actual_master_key:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="Unauthorized: Invalid Sentinel Signature"
        )
    
    return api_key

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
