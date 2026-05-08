import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, Wallet, Cpu, Send } from 'lucide-react';
import { triggerKillSwitch, getSystemStatus } from '../lib/api';

const MirageDashboard = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'مرحباً سيادة المدير التنفيذي. نظام Mirage Sentinel نشط والمفاتيح المشفرة مؤمنة. بانتظار أوامرك الاستراتيجية.' }
  ]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState({ servers: 'ONLINE', balance: 450.75, security: 'MAX' });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // التمرير التلقائي لأسفل الدردشة
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // إضافة رسالة المدير للواجهة
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // منطق ذكاء المدير التنفيذي:
    if (input.includes("تصفير") || input.includes("Kill Switch")) {
      setMessages(prev => [...prev, { role: 'ai', content: "⚠️ جاري استدعاء بروتوكول التدمير الذاتي... فك تشفير المفاتيح... 🔑" }]);
      
      try {
        // التنفيذ الفعلي على السيرفر!
        const result = await triggerKillSwitch(); 
        
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: `✅ تم التنفيذ بنجاح سيدي. السيرفرات المتأثرة: ${result.servers_affected || 2}. تم تحويل مبلغ $${result.funds_transferred || 250.0} لمحفظتك الشخصية. النظام الآن في حالة إغلاق تام.` 
        }]);
        setStatus({ servers: 'TERMINATED', balance: 0, security: 'WIPED' });
      } catch (err) {
        setMessages(prev => [...prev, { role: 'ai', content: "❌ فشل التنفيذ: المفتاح السري غير متطابق مع التشفير السحابي أو السيرفر غير متصل!" }]);
      }
    } else if (input.includes("حالة") || input.includes("status")) {
      setMessages(prev => [...prev, { role: 'ai', content: "جاري فحص حالة النظام..." }]);
      try {
        const result = await getSystemStatus();
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: `📊 حالة النظام: السيرفرات النشطة (${result.active_servers})، المراقبة (${result.monitoring ? 'نشطة' : 'متوقفة'})، مستوى الأمان (${result.security_level}).` 
        }]);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'ai', content: "❌ فشل الاتصال بالسيرفر لجلب الحالة." }]);
      }
    } else {
      // استجابة عادية للأوامر الأخرى
      setMessages(prev => [...prev, { role: 'ai', content: "تم استلام الأمر الاستراتيجي. جاري المعالجة..." }]);
    }

    setInput('');
  };

  return (
    <div className="min-h-screen bg-black text-emerald-400 p-4 font-mono" dir="rtl">
      {/* الشريط العلوي - مؤشرات الحالة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-emerald-900/50 bg-emerald-900/10 p-4 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-3"><Cpu size={20}/> <span>حالة السيرفرات</span></div>
          <span className={status.servers === 'ONLINE' ? "text-emerald-400 animate-pulse" : "text-red-500"}>{status.servers}</span>
        </div>
        <div className="border border-emerald-900/50 bg-emerald-900/10 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3"><Wallet size={20}/> <span>الرصيد المتاح</span></div>
          <span className="text-white">${status.balance}</span>
        </div>
        <div className="border border-emerald-900/50 bg-emerald-900/10 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3"><ShieldAlert size={20}/> <span>مستوى الأمان</span></div>
          <span className="text-cyan-400">{status.security}</span>
        </div>
      </div>

      {/* نافذة الدردشة المركزية */}
      <div className="max-w-4xl mx-auto border border-emerald-500/30 rounded-2xl overflow-hidden bg-black/80 backdrop-blur-xl shadow-2xl h-[70vh] flex flex-col">
        <div className="bg-emerald-900/20 p-4 border-b border-emerald-500/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
            <h2 className="text-lg font-bold">Mirage Strategic Console</h2>
          </div>
          <span className="text-xs text-emerald-700">AES-256 ENCRYPTED SESSION</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'ai' 
                ? 'bg-emerald-900/20 border border-emerald-500/20 rounded-tr-none' 
                : 'bg-white/10 border border-white/20 rounded-tl-none text-white'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* حقل إدخال الأوامر */}
        <div className="p-4 bg-emerald-900/10 border-t border-emerald-500/20 flex gap-4">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="أدخل أمر استراتيجي للمدير التنفيذي..."
            className="flex-1 bg-black border border-emerald-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 text-white"
          />
          <button 
            onClick={handleSendMessage}
            className="bg-emerald-600 hover:bg-emerald-500 text-black p-3 rounded-xl transition-all flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MirageDashboard;
