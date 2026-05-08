#!/bin/bash

# ⚔️ UFO ALBARQ - Cloud Injection Protocol ⚔️
echo "🛡️ Initiating Mirage Protocol Deployment..."

# 1. التأكد من الحساب النشط في Google Cloud
echo "🔍 Checking active Google Cloud identity..."
gcloud auth list

# 2. ضبط المشروع الحالي ليكون Mirage Project
PROJECT_ID="ufo-albarq-mirage-001" # قم بتغيير هذا إلى الـ ID الحقيقي لمشروعك
echo "🎯 Setting target project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# 3. تشفير الملفات الحساسة قبل الرفع النهائي
echo "🔒 Encrypting Sentinel Config..."
# تأكد من وجود ملف sentinel_config.json قبل التشغيل
if [ -f "sentinel_config.json" ]; then
    zip -e mirage_secrets.zip sentinel_config.json
    echo "✅ Encryption complete."
else
    echo "⚠️ Warning: sentinel_config.json not found. Skipping zip encryption."
fi

# 4. رفع العقل المدبر (Backend) إلى Google Cloud Run
echo "🚀 Deploying Mirage Engine to Cloud Run..."
gcloud run deploy mirage-sentinel \
    --source ./backend \
    --region europe-west3 \
    --allow-unauthenticated \
    --memory 512Mi

echo "♊ Deployment Protocol Completed Successfully."
