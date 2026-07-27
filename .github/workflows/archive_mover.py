#!/usr/bin/env python3
# ============================================================
# 🗡️ MIRAGE - النقل إلى الأرشيف
# ============================================================

import os
import shutil
import json
from pathlib import Path
from datetime import datetime

# ============================================================
# 📋 قواعد النقل إلى الأرشيف
# ============================================================
ARCHIVE_FILES = {
    'metadata.json', 'mirageFinalConfig.js', 
    'mirage_alpha_test.py', 'mirage_phantom_protocol.py',
    'zip_project.js', 'ai_studio_code (5).sh',
    'control-panel.js', 'cosmicApp.js',
    'temp_log.txt', 'mirage-ai-log.txt',
    'syncAll.cjs', 'websocket-status.js',
    'server.ts', 'vite.config.ts',
    'firebase-applet-config.json', 'firebase-blueprint.json',
    'firebase-init.js', 'firestore.rules',
    'gcp_ip_rotator.sh', 'harden_gcp.sh',
    'AlBarqHubClient.kt', 'MirageSettingsSheet.kt',
    'SpeedTestManager.kt', 'pubspec.ymal',
    'mirage_project.tar.gz', 'Mirage-Build-Guide.md',
    'package-lock.json', 'yarn.lock', '.DS_Store', 'Thumbs.db'
}

ARCHIVE_DIRS = {
    'node_modules', '__pycache__', '.dart_tool',
    'build', 'dist', '.gradle', '.idea',
    'venv', 'env', '.pytest_cache', 'logs', 'tmp'
}

PROTECTED_FILES = {
    'README.md', '.env.example', '.gitignore',
    'pubspec.yaml', 'package.json', 'l10n.yaml',
    'docker-compose.yml', 'LICENSE', 'main.py'
}

PROTECTED_DIRS = {
    '.git', '.github', 'lib', 'app', 'backend',
    'configs', 'assets', 'docs', 'scripts',
    'infrastructure', 'functions', 'public'
}

# ============================================================
# 🧠 أداة النقل إلى الأرشيف
# ============================================================
class ArchiveMover:
    def __init__(self):
        self.root = Path('.').resolve()
        self.archive_dir = self.root / 'archive'
        self.timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.session_dir = self.archive_dir / f'archive_{self.timestamp}'
        self.report = {
            "timestamp": datetime.now().isoformat(),
            "archived_files": [],
            "archived_dirs": [],
            "protected_files_skipped": [],
            "summary": {}
        }
        self.counters = {"archived_files": 0, "archived_dirs": 0, "skipped": 0}

    def is_protected(self, path: Path) -> bool:
        if path.name.startswith('.'):
            return True
        if str(path).startswith(str(self.archive_dir)):
            return True
        for parent in path.parents:
            if parent.name in PROTECTED_DIRS:
                return True
        if path.name in PROTECTED_FILES:
            return True
        return False

    def ensure_archive_dir(self):
        self.session_dir.mkdir(parents=True, exist_ok=True)
        print(f"📁 مجلد الأرشيف: {self.session_dir}")

    def archive_files(self):
        print("\n📦 [1/4] نقل الملفات إلى الأرشيف...")
        for file_name in ARCHIVE_FILES:
            for file_path in self.root.rglob(file_name):
                if file_path.is_file() and not self.is_protected(file_path):
                    relative_path = file_path.relative_to(self.root)
                    archive_path = self.session_dir / relative_path
                    archive_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.move(str(file_path), str(archive_path))
                    self.report["archived_files"].append(str(relative_path))
                    self.counters["archived_files"] += 1
                    print(f"   📦 نقل: {relative_path}")

    def archive_dirs(self):
        print("\n📦 [2/4] نقل المجلدات إلى الأرشيف...")
        for dir_name in ARCHIVE_DIRS:
            for dir_path in self.root.rglob(dir_name):
                if dir_path.is_dir() and not self.is_protected(dir_path):
                    relative_path = dir_path.relative_to(self.root)
                    archive_path = self.session_dir / relative_path
                    shutil.move(str(dir_path), str(archive_path))
                    self.report["archived_dirs"].append(str(relative_path))
                    self.counters["archived_dirs"] += 1
                    print(f"   📦 نقل مجلد: {relative_path}")

    def archive_empty_files(self):
        print("\n📄 [3/4] نقل الملفات الفارغة إلى الأرشيف...")
        for file_path in self.root.rglob('*'):
            if file_path.is_file() and file_path.stat().st_size == 0 and not self.is_protected(file_path):
                relative_path = file_path.relative_to(self.root)
                archive_path = self.session_dir / relative_path
                archive_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(file_path), str(archive_path))
                self.counters["archived_files"] += 1
                print(f"   📄 نقل ملف فارغ: {relative_path}")

    def generate_report(self):
        print("\n📊 [4/4] إنشاء التقرير النهائي...")
        self.report["summary"] = {
            "archived_files": self.counters["archived_files"],
            "archived_dirs": self.counters["archived_dirs"],
            "skipped_protected": self.counters["skipped"],
            "total_archived": self.counters["archived_files"] + self.counters["archived_dirs"],
            "archive_location": str(self.session_dir.relative_to(self.root))
        }
        report_path = self.root / "archive_report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, indent=2, ensure_ascii=False)
        print(f"   ✅ تم حفظ التقرير في: {report_path}")

    def print_summary(self):
        print("\n" + "="*70)
        print("📊 🗡️  تقرير النقل إلى الأرشيف  🗡️ 📊")
        print("="*70)
        print(f"\n📦 الملفات المنقولة: {self.counters['archived_files']}")
        print(f"📂 المجلدات المنقولة: {self.counters['archived_dirs']}")
        print(f"📦 إجمالي: {self.report['summary']['total_archived']}")
        print(f"📂 موقع الأرشيف: {self.report['summary']['archive_location']}")
        print("\n✅ تم النقل إلى الأرشيف بنجاح!")

    def run(self):
        self.print_header()
        print(f"📂 المسار: {self.root}")
        mode = input("\n🔧 اختر الوضع:\n  (1) محاكاة (dry-run)\n  (2) تنفيذ فعلي\n  (3) إلغاء\nاختيارك: ")
        if mode == '3':
            print("👋 تم الإلغاء.")
            return
        dry_run = mode == '1'
        if dry_run:
            print("\n🔍 وضع المحاكاة - لن يتم نقل أي ملف فعلياً.")
        if not dry_run:
            self.ensure_archive_dir()
        self.archive_files()
        self.archive_dirs()
        self.archive_empty_files()
        self.generate_report()
        self.print_summary()
        if dry_run:
            print("\n💡 محاكاة. لتطبيق النقل، اختر 'تنفيذ فعلي'.")

    def print_header(self):
        print("""
    ╔═══════════════════════════════════════════════════════════════════╗
    ║   🗡️  ميراج - النقل إلى الأرشيف                               🗡️ ║
    ║   📦 ينقل الملفات القديمة إلى مجلد archive/                   ║
    ║   🔒 يحمي الملفات المهمة ولا يمسها                           ║
    ╚═══════════════════════════════════════════════════════════════════╝
        """)

if __name__ == "__main__":
    try:
        mover = ArchiveMover()
        mover.run()
    except KeyboardInterrupt:
        print("\n⚠️ تم إيقاف السكربت بواسطة المستخدم.")
    except Exception as e:
        print(f"\n❌ خطأ غير متوقع: {e}")
