import time

class SentinelMonitor:
    def __init__(self, core_engine):
        self.core = core_engine
        self.is_running = True

    def start_realtime_analysis(self):
        """مراقبة النبض اللحظي للشبكة والتطبيق"""
        while self.is_running:
            # 1. تحليل جودة الاتصال الحالية
            status = self.check_connection_health()
            
            if status == "ANOMALY_DETECTED":
                self.trigger_auto_heal()
            
            # فحص كل 10 ثوانٍ لضمان عدم استهلاك البطارية
            time.sleep(10)

    def check_connection_health(self):
        """كشف الشذوذ في المسارات أو التشفير"""
        latency = self.core.get_current_latency()
        packet_loss = self.core.get_packet_loss()
        
        # إذا زاد التأخير عن 500ms أو حدث فقد للبيانات
        if latency > 500 or packet_loss > 10:
            return "ANOMALY_DETECTED"
        return "STABLE"

    def trigger_auto_heal(self):
        """الإصلاح الفوري بدون تدخل المستخدم"""
        print("[AI Sentinel] عطل مكتشف! جاري إعادة توجيه المسارات...")
        
        # 1. تبديل البروتوكول فوراً (مثلاً من VLESS إلى Hysteria2)
        self.core.switch_to_emergency_protocol()
        
        # 2. تغيير المنفذ (Port) لتجاوز الحجب اللحظي
        self.core.rotate_ports()
        
        # 3. إرسال إشعار للمستخدم في المحادثة الموحدة
        self.core.notify_user("تم كشف محاولة حجب - تم تفعيل وضع الشبح بنجاح ✅")
