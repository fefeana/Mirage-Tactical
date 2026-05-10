import json
import time
import subprocess
from concurrent.futures import ThreadPoolExecutor

class MirageCore:
    def __init__(self, config_path='servers_hub.json'):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        self.active_node = None
        self.mode = "Normal"

    def check_latency(self, node):
        """فحص سرعة الاستجابة بالملي ثانية"""
        try:
            # استخدام أمر ping للنظام للحصول على نتائج دقيقة وسريعة
            start = time.perf_counter()
            output = subprocess.run(
                ["ping", "-c", "1", "-W", "1", node['host']], 
                stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
            end = time.perf_counter()
            
            if output.returncode == 0:
                return (end - start) * 1000, node
            return float('inf'), node
        except Exception:
            return float('inf'), node

    def get_best_route(self):
        """تنظيم التبديل التلقائي واختيار المسار الأسرع"""
        all_nodes = self.config['nodes']['local_optimization'] + self.config['nodes']['global_backbone']
        
        # تنفيذ الفحص بالتوازي (Parallel) لضمان السرعة القصوى وعدم تعليق التطبيق
        with ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(self.check_latency, all_nodes))
        
        # ترتيب الخوادم من الأقل Latency للأعلى
        sorted_nodes = sorted(results, key=lambda x: x[0])
        best_node = sorted_nodes[0][1]
        
        self.active_node = best_node
        return best_node

    def apply_protocol_settings(self, node):
        """ربط المكتبات مباشرة لتجهيز التشفير والبروتوكول"""
        # هنا يتم الربط مع libxtls أو libhysteria بناءً على البروتوكول
        print(f"Applying {node['protocol']} on {node['host']}...")
        # منطق التبديل للشبح (Ghost Mode) إذا كان البروتوكول يدعم ذلك
        if "Reality" in node['protocol']:
            self.enable_stealth_mode()
            
    def enable_stealth_mode(self):
        self.mode = "Ghost"
        print("Ghost mode activated via XTLS-Reality.")

    def optimize_connection(self):
        best = self.get_best_route()
        self.apply_protocol_settings(best)
        return f"Connected via {best['protocol']} | Mode: {self.mode}"

def update_ui_indicator(state):
    """
    تحديث حالة المؤشر الانيق في UI
    States: 'searching', 'connected', 'ghost'
    """
    if state == "searching":
        # تفعيل النبض الذهبي (Gold Pulse)
        print("UI_STATE: searching - color=#FFD700 effect=pulse")
    elif state == "connected":
        # تفعيل التوهج الزمردي الثابت (Emerald Glow)
        print("UI_STATE: connected - color=#50C878 effect=solid_glow")
    elif state == "ghost":
        # تفعيل التمويه الأرجواني (Purple Blur)
        print("UI_STATE: ghost - color=#A020F0 effect=stealth_blur")

if __name__ == "__main__":
    update_ui_indicator("searching")
    core = MirageCore()
    status = core.optimize_connection()
    print(status)
    if core.mode == "Ghost":
        update_ui_indicator("ghost")
    else:
        update_ui_indicator("connected")
