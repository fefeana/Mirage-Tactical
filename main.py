from kivy.app import App
from kivy.uix.floatlayout import FloatLayout
from kivy.lang import Builder
from kivy.animation import Animation
from kivy.graphics import Color, Line
from kivy.clock import Clock
from kivy.properties import BooleanProperty

# --- الجزء الأول: تصميم واجهة Mirage Tactical (KV) ---
# تم ضبط الألوان والأبعاد لتطابق ذوقك في الصور
KV = '''
<TacticalUI>:
    canvas.before:
        Color:
            rgba: 0.02, 0.02, 0.06, 1  # الخلفية السوداء العميقة
        Rectangle:
            pos: self.pos
            size: self.size

    # اسم المشروع الفخم
    Label:
        text: "MIRAGE TACTICAL"
        font_size: '26sp'
        bold: True
        color: 0.6, 0.3, 1, 1
        pos_hint: {'center_x': .5, 'top': .93}

    Label:
        text: "GOD MODE / SENTINEL VPN"
        font_size: '13sp'
        color: 0.4, 0.4, 0.5, 1
        pos_hint: {'center_x': .5, 'top': .89}

    # مؤشر الحالة (تتغير النقطة والكلمة حسب الاتصال)
    BoxLayout:
        orientation: 'horizontal'
        size_hint: None, None
        size: "200dp", "30dp"
        pos_hint: {'center_x': .5, 'top': .83}
        spacing: "10dp"
        
        canvas.before:
            Color:
                rgba: (0, 1, 0.5, 1) if root.is_active else (0.4, 0.4, 0.4, 1)
            Ellipse:
                pos: self.x + 10, self.y + 7
                size: "12dp", "12dp"

        Label:
            text: "Mirage Sentinel: Active" if root.is_active else "Standby Mode"
            font_size: '16sp'
            color: 1, 1, 1, 1

    # الزر الرئيسي (البنفسجي) مع البرمجة التفاعلية
    Button:
        id: main_btn
        text: "SYSTEM LIVE" if root.is_active else "ESTABLISH LINK"
        size_hint: None, None
        size: "280dp", "75dp"
        pos_hint: {"center_x": .5, "center_y": .4}
        background_normal: ''
        background_color: (0, 0, 0, 0)  # شفاف للتحكم في الرسم اليدوي
        font_size: '20sp'
        bold: True
        on_release: root.toggle_system()

        canvas.before:
            Color:
                rgba: (0.5, 0, 1, 1) if root.is_active else (0.2, 0.1, 0.4, 1)
            RoundedRectangle:
                pos: self.pos
                size: self.size
                radius: [37,]
            # توهج خفيف (Glow) للزر عند التفعيل
            Color:
                rgba: (0.5, 0, 1, 0.2) if root.is_active else (0, 0, 0, 0)
            RoundedRectangle:
                pos: self.x-5, self.y-5
                size: self.width+10, self.height+10
                radius: [40,]
'''

# --- الجزء الثاني: منطق الحركة والبث (Python) ---
class TacticalUI(FloatLayout):
    is_active = BooleanProperty(False)

    def toggle_system(self):
        # تبديل الحالة عند الضغط على الزر
        self.is_active = not self.is_active
        
        if self.is_active:
            # ابدأ إرسال موجات الصدى كل 1.3 ثانية
            self.pulse_event = Clock.schedule_interval(self.spawn_ripple, 1.3)
        else:
            # أوقف الموجات عند قطع الاتصال
            if hasattr(self, 'pulse_event'):
                Clock.unschedule(self.pulse_event)

    def spawn_ripple(self, dt):
        # تحديد مركز الزر لخروج الموجة منه
        cx, cy = self.ids.main_btn.center
        
        with self.canvas.before:
            # لون الموجة بنفسجي متلاشي (صدى الصوت)
            color = Color(0.6, 0.2, 1, 0.6)
            wave = Line(circle=(cx, cy, 50), width=1.5)

        # تحريك الموجة (توسيع القطر + تلاشي الشفافية)
        anim = Animation(
            circle=(cx, cy, 280), 
            opacity=0, 
            duration=2.5, 
            t='out_sine'
        )
        
        # تنظيف الذاكرة بعد تلاشي الموجة
        def clean_up(a, w):
            self.canvas.before.remove(wave)
            self.canvas.before.remove(color)
        
        anim.bind(on_complete=clean_up)
        anim.start(wave)

class MirageTacticalApp(App):
    def build(self):
        # تحميل واجهة KV وتشغيلها
        return Builder.load_string(KV)

if __name__ == '__main__':
    MirageTacticalApp().run()
