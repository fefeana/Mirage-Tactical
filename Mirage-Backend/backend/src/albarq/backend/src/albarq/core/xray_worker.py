"""
xray_worker.py - عمال Xray الموزعين (تتواصل مع Broker المركزي)
"""
import asyncio
import json
import secrets
from typing import Dict
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
import logging
from ..services.mcp_key_broker import broker

logger = logging.getLogger("Mirage-XRay-Worker")

class XRayMCPWorker:
    def __init__(self, region: str = "global"):
        self.region = region
        self.active_tunnels: Dict[str, Dict] = {}

    async def handle_connection_request(self, session_id: str, client_payload: dict) -> dict:
        device_id = client_payload.get("device_id")
        if not device_id:
            return {"status": "error", "message": "Missing device auth"}

        key_data = broker.generate_temp_key(session_id, self.region)
        return {
            "status": "success",
            "session_id": session_id,
            "region": self.region,
            "temp_key_hex": key_data["key_hex"],
            "expiry": key_data["expiry"],
            "message": f"✅ مفتاح مؤقت من {self.region}"
        }

    async def establish_tunnel(self, session_id: str, encrypted_data: bytes) -> bytes:
        temp_key = broker.verify_key(session_id)
        if not temp_key:
            return b"ERROR: INVALID_OR_EXPIRED_KEY"

        try:
            chacha = ChaCha20Poly1305(temp_key)
            nonce = encrypted_data[:12]
            ciphertext = encrypted_data[12:]
            decrypted_data = chacha.decrypt(nonce, ciphertext, None)
            
            logger.info(f"📦 [{self.region}] استقبال من {session_id[:8]}...")
            response_data = b"HTTP/1.1 200 OK\r\n\r\nMirage MCP Tunnel Active"
            encrypted_response = chacha.encrypt(nonce, response_data, None)
            return nonce + encrypted_response
            
        except Exception as e:
            logger.error(f"❌ فك تشفير فاشل: {e}")
            broker.revoke_key(session_id, self.region)
            return b"ERROR: DECRYPTION_FAILED"

    async def close_tunnel(self, session_id: str) -> dict:
        revoked = broker.revoke_key(session_id, self.region)
        if revoked:
            if session_id in self.active_tunnels:
                del self.active_tunnels[session_id]
            return {"status": "success", "message": "🗑️ تم إتلاف المفتاح."}
        return {"status": "error", "message": "الجلسة غير موجودة"}
