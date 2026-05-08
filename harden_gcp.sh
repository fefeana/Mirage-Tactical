#!/bin/bash

# ==============================================================================
# UFO ALBARQ - GCP Server Hardening Protocol (Samurai Edition)
# ==============================================================================
# Description: Automates the initial security hardening of a Google Compute Engine
#              instance for the UFO ALBARQ VPN infrastructure.
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status.

echo "⚔️ [UFO ALBARQ] Initiating Server Hardening Protocol..."

# --- 1. System Update & Cleanup ---
echo "[-] Phase 1: System Update & Cleanup..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get autoremove -y
sudo apt-get clean

# --- 2. Firewall Configuration (UFW) ---
echo "[-] Phase 2: Configuring Firewall (UFW)..."
sudo apt-get install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (Consider changing the default port in production)
sudo ufw allow 22/tcp
# Allow HTTPS for standard secure traffic
sudo ufw allow 443/tcp
# Allow custom VPN port (e.g., WireGuard default is 51820/udp)
# sudo ufw allow 51820/udp 

sudo ufw --force enable
echo "[+] UFW Active."

# --- 3. SSH Service Hardening ---
echo "[-] Phase 3: Hardening SSH Service..."
SSHD_CONFIG="/etc/ssh/sshd_config"

# Backup original config
sudo cp $SSHD_CONFIG ${SSHD_CONFIG}.bak

# Disable Root Login
sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' $SSHD_CONFIG
# Disable Password Authentication (Enforce Key-Based Auth)
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' $SSHD_CONFIG
# Limit Authentication Tries
sudo sed -i 's/^#*MaxAuthTries.*/MaxAuthTries 3/' $SSHD_CONFIG
# Disable Empty Passwords
sudo sed -i 's/^#*PermitEmptyPasswords.*/PermitEmptyPasswords no/' $SSHD_CONFIG

sudo systemctl restart ssh
echo "[+] SSH Hardened."

# --- 4. Fail2Ban Deployment ---
echo "[-] Phase 4: Deploying Fail2Ban..."
sudo apt-get install fail2ban -y

# Create a local jail configuration to prevent overwriting during updates
cat <<EOF | sudo tee /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
echo "[+] Fail2Ban Active."

# --- 5. Kernel Hardening (Sysctl Tweaks) ---
echo "[-] Phase 5: Applying Kernel Hardening..."
SYSCTL_CONF="/etc/sysctl.d/99-ufo-albarq.conf"

cat <<EOF | sudo tee $SYSCTL_CONF
# Prevent IP Spoofing
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Disable ICMP Redirects (Prevent routing manipulation)
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# Enable SYN Flood Protection
net.ipv4.tcp_syncookies = 1

# Ignore ICMP Echo Requests (Ping) - Optional, uncomment if stealth is required
# net.ipv4.icmp_echo_ignore_all = 1

# Disable IPv6 if not used (Uncomment if strictly IPv4)
# net.ipv6.conf.all.disable_ipv6 = 1
# net.ipv6.conf.default.disable_ipv6 = 1
# net.ipv6.conf.lo.disable_ipv6 = 1
EOF

sudo sysctl -p $SYSCTL_CONF
echo "[+] Kernel Parameters Applied."

# --- 6. Unattended Upgrades ---
echo "[-] Phase 6: Enabling Unattended Upgrades..."
sudo apt-get install unattended-upgrades -y
# Ensure it's enabled (non-interactive)
echo 'APT::Periodic::Update-Package-Lists "1";' | sudo tee /etc/apt/apt.conf.d/20auto-upgrades
echo 'APT::Periodic::Unattended-Upgrade "1";' | sudo tee -a /etc/apt/apt.conf.d/20auto-upgrades

echo "⚔️ [UFO ALBARQ] Hardening Complete. The GCP Server is now Armored."
