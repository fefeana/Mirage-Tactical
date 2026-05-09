import base64
import requests
import os

def syncToGitHub(event, context):
    """
    Cloud Function لرفع الملفات تلقائيًا من Google AI Studio (Gemini) إلى GitHub

    🔧 طريقة التشغيل:
    1. انسخ هذا الكود وضعه في ملف Python داخل مشروعك في Google AI Studio.
    2. اربط المشروع بـ Google Cloud Functions من لوحة التحكم.
    3. سمِّ الوظيفة: syncToGitHub.
    4. أضف متغير بيئة باسم GITHUBREPOTOKEN يحتوي على مفتاح الوصول الشخصي من GitHub (PAT).
    5. اربط الوظيفة بـ Webhook من Gemini أو GitHub بحيث كل تعديل أو حفظ يطلق هذه الوظيفة.
    6. عند التشغيل، أي ملف يتم حفظه في Gemini يُرسل تلقائيًا إلى GitHub (فرع main).
    """

    # إعدادات المستودع
    repo = "Shighy/AlBarq_2026"   # غيّر هذا باسم مستودعك
    branch = "main"               # الفرع المستهدف
    token = os.environ.get("GITHUBREPOTOKEN")

    # استخراج البيانات من الحدث القادم من AI Studio
    filename = event['attributes'].get('filename', 'default.txt')
    file_content = base64.b64decode(event['data']).decode('utf-8')

    # إعداد الطلب إلى GitHub API
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }

    url = f"https://api.github.com/repos/{repo}/contents/{filename}"

    # جلب SHA الحالي للملف (لو موجود)
    sha = None
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        sha = response.json().get("sha")

    # تجهيز البيانات للرفع
    data = {
        "message": "Auto-sync from Google AI Studio (Gemini)",
        "content": base64.b64encode(file_content.encode()).decode(),
        "branch": branch
    }
    if sha:
        data["sha"] = sha

    # رفع الملف إلى GitHub
    response = requests.put(url, json=data, headers=headers)

    if response.status_code in [200, 201]:
        print(f"✅ File {filename} synced successfully to {repo}/{branch}")
    else:
        print(f"⚠️ Sync failed: {response.status_code} → {response.text}")
