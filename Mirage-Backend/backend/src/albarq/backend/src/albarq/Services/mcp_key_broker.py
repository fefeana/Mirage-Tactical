"""
mcp_key_broker.py - الموزع الرئيسي للمفاتيح المؤقتة (Master Key Broker)
يدير 8000 خادم MCP عبر Redis Cluster.
"""
import os
import redis
import secrets
import time
import json
from typing import Optional, Dict
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

# اتصال بـ Redis (خادم الذاكرة المركزية)
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True,
    password=os.getenv("REDIS_PASSWORD", None)
)

class MCPKeyBroker:
    def __init__(self):
        self.salt = secrets.token_bytes(32)

    def generate_temp_key(self, session_id: str, region: str = "global") -> Dict:
        raw_material = secrets.token_bytes(32)
        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=self.salt + region.encode() + session_id.encode(),
            info=b"mirage-mcp-key-v1",
        )
        final_key = hkdf.derive(raw_material + session_id.encode())
        expiry = int(time.time()) + 300

        key_data = {
            "key_hex": final_key.hex(),
            "region": region,
            "expiry": expiry,
            "created_at": int(time.time())
        }

        redis_client.setex(
            name=f"mcp:session:{session_id}",
            time=300,
            value=json.dumps(key_data)
        )
        redis_client.sadd(f"mcp:region:{region}:sessions", session_id)
        return key_data

    def verify_key(self, session_id: str) -> Optional[bytes]:
        raw_data = redis_client.get(f"mcp:session:{session_id}")
        if not raw_data:
            return None
        key_data = json.loads(raw_data)
        if int(time.time()) > key_data["expiry"]:
            redis_client.delete(f"mcp:session:{session_id}")
            return None
        return bytes.fromhex(key_data["key_hex"])

    def revoke_key(self, session_id: str, region: str) -> bool:
        deleted = redis_client.delete(f"mcp:session:{session_id}")
        if deleted:
            redis_client.srem(f"mcp:region:{region}:sessions", session_id)
            return True
        return False

# إنشاء نسخة وحيدة (Singleton) يشاركها جميع العمال
broker = MCPKeyBroker()
