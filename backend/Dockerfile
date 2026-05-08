# ⚔️ UFO ALBARQ - Mirage Engine Dockerfile
FROM python:3.10-slim

# إعداد بيئة العمل
WORKDIR /app

# تثبيت المتطلبات
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# نسخ العقل المدبر وبروتوكولات التشفير
COPY . .

# حماية الملفات (صلاحيات القراءة والتنفيذ فقط)
RUN chmod -R 755 /app

# كشف المنفذ للـ Cloud Run
EXPOSE 8080

# تشغيل محرك Mirage
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
