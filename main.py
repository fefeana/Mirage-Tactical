import base64
import requests
import os
import google.generativeai as genai

# الإعدادات المباشرة
GEMINI_API_KEY = "ضـع_مفـتاح_جيمـيني_هـنا"
GITHUB_TOKEN = "ضـع_تـوكن_جيـت_هـاب_هـنا"
REPO_PATH = "Shighy/AlBarq_2026"
BRANCH = "main"

def sync_albarq_to_github(event, context):
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        filename = event.get('attributes', {}).get('filename', 'AlBarq_Update.txt')
        input_content = base64.b64decode(event.get('data', '')).decode('utf-8') if 'data' in event else "تحديث تلقائي"

        # معالجة Gemini
        response = model.generate_content(f"نسق البيانات لمشروع البرق: {input_content}")
        processed_data = response.text

        # رفع لـ GitHub
        headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
        url = f"https://api.github.com/repos/{REPO_PATH}/contents/{filename}"
        
        # جلب SHA للتحديث
        res = requests.get(url, headers=headers)
        sha = res.json().get("sha") if res.status_code == 200 else None

        payload = {
            "message": "⚡ AlBarq Sync",
            "content": base64.b64encode(processed_data.encode('utf-8')).decode('utf-8'),
            "branch": BRANCH
        }
        if sha: payload["sha"] = sha

        requests.put(url, json=payload, headers=headers)
        return "Success"
    except Exception as e:
        print(f"Error: {e}")
        return "Error"
