import base64
import requests
import os

def syncToGitHub(event, context):
    """
    Cloud Function لرفع الملفات تلقائيًا من Google AI Studio (Gemini) إلى GitHub

    🔧 طريقة التشغيل:
    1. انسخ هذا الكود وضعه في مستودع مستقل وانشره إلى Cloud Functions
    2. اربط المشروع بـ Google Cloud Functions.
    3. أضف متغير بيئة GITHUB_REPO_TOKEN.
    """

    # إعدادات المستودع
    repo = "Shighy/AlBarq_2026"   # المستودع
    branch = "main"               # الفرع
    token = os.environ.get("GITHUB_REPO_TOKEN")

    if not token:
        print("⚠️ Missing GITHUB_REPO_TOKEN")
        return

    # استخراج البيانات من الحدث
    filename = event.get('attributes', {}).get('filename', 'default.txt')
    file_content = ""
    
    if 'data' in event:
        file_content = base64.b64decode(event['data']).decode('utf-8')

    # إعداد الطلب إلى GitHub API
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    url = f"https://api.github.com/repos/{repo}/contents/{filename}"

    # جلب SHA للملف الحالي إذا وجد
    sha = None
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        sha = response.json().get("sha")

    # تجهيز الرفع
    data = {
        "message": "Auto-sync from Google AI Studio (Gemini) - AlBarq",
        "content": base64.b64encode(file_content.encode('utf-8')).decode('utf-8'),
        "branch": branch
    }
    if sha:
        data["sha"] = sha

    # رفع المستند
    put_response = requests.put(url, json=data, headers=headers)

    if put_response.status_code in [200, 201]:
        print(f"✅ File {filename} synced successfully to {repo}/{branch}")
    else:
        print(f"⚠️ Sync failed: {put_response.status_code} → {put_response.text}")
