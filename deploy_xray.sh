#!/bin/bash

# ==============================================================================
# UFO ALBARQ - Xray (VLESS/XTLS-Reality) Deployment Protocol
# ==============================================================================
# Description: Automates the installation and configuration of Xray-core with
#              VLESS and XTLS-Reality for maximum stealth and performance on GCP.
# ==============================================================================

set -e

echo "⚔️ [UFO ALBARQ] Initiating Xray (VLESS/XTLS-Reality) Deployment..."

# --- 1. Install Xray-core ---
echo "[-] Phase 1: Installing Xray-core..."
# Using the official installation script
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install

# --- 2. Generate Cryptographic Keys ---
echo "[-] Phase 2: Generating X25519 Keys and UUID..."
# Generate UUID for the client
CLIENT_UUID=$(xray uuid)
echo "[+] Generated Client UUID: $CLIENT_UUID"

# Generate X25519 key pair for Reality
KEYS=$(xray x25519)
PRIVATE_KEY=$(echo "$KEYS" | grep "Private key:" | awk '{print $3}')
PUBLIC_KEY=$(echo "$KEYS" | grep "Public key:" | awk '{print $3}')
echo "[+] Generated Private Key: (Hidden for security)"
echo "[+] Generated Public Key: $PUBLIC_KEY"

# Generate a random short ID (hex)
SHORT_ID=$(openssl rand -hex 8)
echo "[+] Generated Short ID: $SHORT_ID"

# --- 3. Configure Xray ---
echo "[-] Phase 3: Configuring Xray (/usr/local/etc/xray/config.json)..."

# Target domain for Reality masking (Must be TLS 1.3, e.g., www.microsoft.com, www.apple.com)
DEST_DOMAIN="www.microsoft.com"
LISTEN_PORT=443

cat <<EOF | sudo tee /usr/local/etc/xray/config.json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port": $LISTEN_PORT,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "$CLIENT_UUID",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "$DEST_DOMAIN:443",
          "xver": 0,
          "serverNames": [
            "$DEST_DOMAIN"
          ],
          "privateKey": "$PRIVATE_KEY",
          "shortIds": [
            "$SHORT_ID"
          ]
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "tag": "blocked"
    }
  ]
}
EOF

# --- 4. Firewall Configuration (UFW) ---
echo "[-] Phase 4: Updating Firewall Rules..."
# Ensure the listen port is open
sudo ufw allow $LISTEN_PORT/tcp
sudo ufw reload
echo "[+] Port $LISTEN_PORT opened."

# --- 5. Restart and Enable Xray ---
echo "[-] Phase 5: Restarting Xray Service..."
sudo systemctl restart xray
sudo systemctl enable xray
echo "[+] Xray Service is Active."

# --- 6. Output Client Configuration Details ---
echo "=============================================================================="
echo "⚔️ [UFO ALBARQ] Xray Deployment Complete."
echo "=============================================================================="
echo "Client Configuration Details (Save these securely):"
echo "------------------------------------------------------------------------------"
echo "Address (Server IP) : <YOUR_GCP_EXTERNAL_IP>"
echo "Port                : $LISTEN_PORT"
echo "UUID                : $CLIENT_UUID"
echo "Flow                : xtls-rprx-vision"
echo "Network             : tcp"
echo "Security            : reality"
echo "SNI (Server Name)   : $DEST_DOMAIN"
echo "Public Key          : $PUBLIC_KEY"
echo "Short ID            : $SHORT_ID"
echo "Fingerprint         : chrome (or firefox/safari)"
echo "------------------------------------------------------------------------------"
echo "Use these details to configure the Android Kotlin client."
