#!/bin/bash

# ==============================================================================
# UFO ALBARQ - GCP Autonomous IP Rotator (Self-Healing Protocol)
# ==============================================================================
# Description: Monitors Xray-core port. If blocked/down, it uses gcloud CLI
#              to dynamically release the blocked IP and assign a fresh one.
# ==============================================================================

# --- Configuration (The General's Orders) ---
INSTANCE_NAME="ufo-albarq-server-1"
ZONE="us-central1-a"
REGION="us-central1"
CHECK_INTERVAL=30 # Seconds between health checks
TARGET_PORT=443   # Xray listening port

echo "⚔️ [UFO ALBARQ] Samurai System Active: GCP Server Monitoring Initiated..."

while true; do
    # 1. Tactical Health Check
    # Check if the server responds on the Xray port
    # Note: In a real scenario, you'd check from an external location, 
    # but for this script running locally/management server, we check the port status.
    if ! timeout 5s nc -zv localhost $TARGET_PORT > /dev/null 2>&1; then
        echo "⚠️ [ALERT] Blockage or Server Crash Detected! Initiating Camouflage Protocol..."

        # 2. Release the Blocked IP
        echo "🔄 [-] Releasing compromised IP address..."
        gcloud compute instances delete-access-config $INSTANCE_NAME \
            --access-config-name="External NAT" --zone=$ZONE --quiet || true

        # 3. Assign a New Static IP
        echo "🛡️ [-] Calling reinforcements: Allocating new Static IP..."
        NEW_IP_NAME="ufo-ip-$(date +%s)"
        
        # Create new address
        gcloud compute addresses create $NEW_IP_NAME \
            --region=$REGION --quiet
            
        # Retrieve the actual IP string
        NEW_IP=$(gcloud compute addresses describe $NEW_IP_NAME \
            --region=$REGION --format="value(address)")

        # Attach to instance
        gcloud compute instances add-access-config $INSTANCE_NAME \
            --access-config-name="External NAT" \
            --address=$NEW_IP --zone=$ZONE --quiet

        echo "✅ [+] Operation Successful! Server is now operating under new identity: $NEW_IP"
        
        # 4. Update API/Database (Optional but crucial for the Android app to know the new IP)
        # echo "[-] Updating Central API with new IP..."
        # curl -X POST https://api.ufoalbarq.com/update-node \
        #      -H "Authorization: Bearer <SECRET_TOKEN>" \
        #      -d "{\"node_id\":\"$INSTANCE_NAME\", \"new_ip\":\"$NEW_IP\"}"
             
        # Restart Xray to bind to new interface if necessary
        sudo systemctl restart xray
        
    else
        echo "🟢 [+] Pulse Stable. Server is in standby mode."
    fi

    sleep $CHECK_INTERVAL
done
