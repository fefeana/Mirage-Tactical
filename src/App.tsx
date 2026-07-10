import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "sonner";
import AdminDashboard from "./AdminDashboard";
import ClientPortal from "./ClientPortal";
import CyberLogin from "./components/CyberLogin";
import IdentityGate from "./components/IdentityGate";
import { ErrorBoundary } from "./ErrorBoundary";
import FinanceCenter from "./FinanceCenter";
import SettingsPage from "./SettingsPage";
import CloudDashboard from "./CloudDashboard";
import AiSentinel from "./AiSentinel";
import { globalDBManager } from "./services/AppDatabaseManager";
import { activateAntiYellowShield } from "./sentinelCore";
import BouziehSplash from "./components/BouziehSplash";
import FMStarSplash from "./components/FMStarSplash";
import "./app.css";

export default function App() {
  const [lang, setLang] = useState("ar");
  const [theme, setTheme] = useState("golden");
  const [showBouzieh, setShowBouzieh] = useState(false);
  const [showFMStar, setShowFMStar] = useState(false);

  useEffect(() => {
    // ⚡ Main Attachments
    console.log("⚡💪🚀🌿🫰 واجهة نور قلبي – اللواحق الرئيسية مثبتة بالكامل");
    console.log("🔒 تفعيل المستند: استعادة لوحة التحكم والدعم المالي واللغات والإصلاح الذاتي.");
    
    // Auto-Heal & PayPal Simulator Flags
    window.localStorage.setItem('UI_THEME_LOCK', 'NOR_QALBI');
    window.localStorage.setItem('FINANCE_WALLET', 'PayPal-External-Wallet');
    window.localStorage.setItem('SUPPORTED_LANGUAGES', JSON.stringify(['ar', 'en', 'fr']));
    
    const userLang = navigator.language.split("-")[0];
    setLang(userLang || "ar");

    // بدء تغذية الـ AI من قاعدة البيانات عند تشغيل التطبيق
    globalDBManager.startRealtimeFeed();
    activateAntiYellowShield();

    const handleBouziehCmd = () => setShowBouzieh(true);
    const handleFMStarCmd = () => setShowFMStar(true);
    const handleNoorQalbi = () => {
      setTheme("golden");
      toast.success("✨ نور قلبي: تم تغيير الثيم إلى Golden Spark", {
        style: { background: "linear-gradient(90deg, #ffcc00, #ff8800)", color: "#fff", border: "none" }
      });
      document.body.style.transition = "all 2s ease-in-out";
      document.body.style.backgroundColor = "#ffcc00";
      setTimeout(() => document.body.style.backgroundColor = "", 3000);
    };
    const handleJnahHob = () => {
      toast("🕊️ جناح الحب: تفعيل وضع الطيران الروحي", {
        description: "اتصالك الآن يسبح في طبقات الأثير بأمان وحرية.",
        style: { background: "linear-gradient(90deg, #8A2BE2, #00FFDD)", color: "#fff", border: "none" }
      });
    };

    window.addEventListener('BOUZIEH_RITUAL', handleBouziehCmd);
    window.addEventListener('FMSTAR_RITUAL', handleFMStarCmd);
    window.addEventListener('NOOR_QALBI', handleNoorQalbi);
    window.addEventListener('JNAH_HOB', handleJnahHob);

    return () => {
      globalDBManager.stopRealtimeFeed();
      window.removeEventListener('BOUZIEH_RITUAL', handleBouziehCmd);
      window.removeEventListener('FMSTAR_RITUAL', handleFMStarCmd);
      window.removeEventListener('NOOR_QALBI', handleNoorQalbi);
      window.removeEventListener('JNAH_HOB', handleJnahHob);
    };
  }, []);

  const fontMap: Record<string, string> = {
    ar: "'Amiri', serif",
    en: "'Roboto', sans-serif",
    tr: "'Poppins', sans-serif",
    zh: "'Noto Sans SC', sans-serif",
    ja: "'Noto Sans JP', sans-serif",
    ko: "'Noto Sans KR', sans-serif",
    hi: "'Noto Sans Devanagari', sans-serif",
    ru: "'PT Sans', sans-serif",
    he: "'Noto Sans Hebrew', sans-serif",
    fa: "'Vazirmatn', sans-serif",
  };

  const appStyle = {
    fontFamily: fontMap[lang] || "'Roboto', sans-serif",
    transition: "background-color 2s ease",
  };

  return (
    <div style={appStyle} className={`theme-${theme}`}>
      {showBouzieh && <BouziehSplash onClose={() => setShowBouzieh(false)} />}
      {showFMStar && <FMStarSplash onClose={() => setShowFMStar(false)} />}
      <ErrorBoundary>
        <Toaster
          position="top-center"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: "rgba(5, 11, 20, 0.9)",
              border: "1px solid rgba(255, 0, 68, 0.5)",
              color: "#fff",
              backdropFilter: "blur(10px)",
            },
          }}
        />
        <Router>
          <Routes>
            <Route path="/" element={<ClientPortal />} />
            <Route path="/cloud" element={<CloudDashboard />} />
            <Route path="/finance" element={<FinanceCenter />} />
            <Route path="/portal" element={<ClientPortal />} />
            <Route path="/sso" element={<CyberLogin />} />
            <Route path="/gate" element={<IdentityGate />} />
            <Route path="/hq/:key" element={<AdminDashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/ai-sentinel" element={<AiSentinel />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </div>
  );
          }
