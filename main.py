import json
import threading
from kivy.app import App
from kivy.clock import Clock
from core_engine import MirageCore

class UnifiedSentinelAI:
    def __init__(self):
        self.image_keywords = ["صورة", "صمم", "تخيل", "image", "generate", "design"]

    def process_request(self, user_input):
        # 1. تمييز النية (Intent Detection)
        if any(word in user_input.lower() for word in self.image_keywords):
            return "IMAGE_MODE", self.generate_art(user_input)
        else:
            return "TEXT_MODE", self.analyze_support(user_input)

    def analyze_support(self, text):
        # هنا يتم الربط مع Gemini API لتحليل المشاعر والدعم
        # لمحاكاة الرد الذكي المرتبط بحالة النظام
        return f"Sentinel: تم استلام ملاحظتك. جاري فحص استقرار البروتوكول بناءً على تقريرك..."

    def generate_art(self, prompt):
        # الربط مع Nano Banana 2 لتوليد الصور بنمط Cyberpunk
        return "IMAGE_PATH_OR_BUFFER"

class MirageUFOApp(App):
    def build(self):
        self.core = MirageCore()
        self.ai_sentinel = UnifiedSentinelAI()
        return super().build()

    def send_message(self, text):
        """الوظيفة الرئيسية للمحادثة الموحدة"""
        # تشغيل المؤشر الذهبي (جاري التفكير)
        self.update_indicator("searching")
        
        # تشغيل المعالجة في خلفية لعدم التأثير على أداء الـ VPN
        threading.Thread(target=self._handle_ai_logic, args=(text,)).start()

    def _handle_ai_logic(self, text):
        mode, response = self.ai_sentinel.process_request(text)
        
        # تحديث الواجهة بناءً على النتيجة
        if mode == "IMAGE_MODE":
            Clock.schedule_once(lambda dt: self.display_image(response))
            Clock.schedule_once(lambda dt: self.update_indicator("ghost"))
        else:
            Clock.schedule_once(lambda dt: self.display_text(response))
            Clock.schedule_once(lambda dt: self.update_indicator("connected"))

    def update_indicator(self, state):
        # الربط مع الواجهة الرسومية (الخيط النيوني)
        panel = self.root.ids.mirage_panel
        colors = {"searching": [1, 0.84, 0, 1], "connected": [0.31, 0.78, 0.47, 1], "ghost": [0.63, 0.13, 0.94, 1]}
        panel.glow_color = colors.get(state, [1, 1, 1, 1])

# التنفيذ
if __name__ == '__main__':
    MirageUFOApp().run()
