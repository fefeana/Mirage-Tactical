#!/bin/bash
# UFO ALBARQ - SAMURAI NODE PROVISIONING SCRIPT

export DEBIAN_FRONTEND=noninteractive
echo "[*] Initiating Mirage Node Setup Sequence..."

# 1. Update & Install Prerequisites
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git ufw jq iptables iproute2

# 2. Enable TCP BBR for Ultra-low Latency
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p

# 3. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# 4. Pull required engine images (Sing-box & Xray)
docker pull gzxhwq/xray:latest
docker pull ghcr.io/sagernet/sing-box:latest

# 5. Configure Firewall (The Shield)
ufw --force enable
ufw allow 22/tcp          # SSH Access
ufw allow 80/tcp          # HTTP
ufw allow 443/tcp         # Xray / VLESS-Reality
ufw allow 443/udp         # Hysteria2 (Aggressive UDP)
ufw allow 10808/tcp       # SOCKS5 fallback

echo "[*] Firewall configured for Stealth & Maximum Power."

# 6. Initialize Core Directories
mkdir -p /etc/mirage
mkdir -p /var/log/mirage
echo "MIRAGE CORE INITIALIZED" > /etc/mirage/status.txt

echo "[OK] Samurai Node 01 is ONLINE. BBR Active. Standing by for telemetry sync."
