import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Globe, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingsPageProps {
  lang: string;
  setLang: (lang: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

export default function SettingsPage({ lang, setLang, theme, setTheme }: SettingsPageProps) {
  const navigate = useNavigate();

  const languages = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'tr', label: 'Türkçe' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'ru', label: 'Русский' },
  ];

  const themes = [
    { id: 'dark', label: 'Dark Mode', color: '#111' },
    { id: 'light', label: 'Light Mode', color: '#f9f9f9' },
    { id: 'golden', label: 'Golden Theme', color: '#fff8e1' },
  ];

  return (
    <div className={`w-full min-h-screen p-6 flex flex-col font-sans transition-colors duration-500`}>
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold tracking-widest uppercase">
          {lang === 'ar' ? 'الإعدادات' : 'Settings'}
        </h1>
      </div>

      <div className="space-y-8 max-w-lg mx-auto w-full">
        <section className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-[#00FF9D]" size={20} />
            <h2 className="text-lg font-bold">
              {lang === 'ar' ? 'اللغة' : 'Language'}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`p-3 rounded-xl border transition-all ${
                  lang === l.code 
                    ? 'border-[#00FF9D] bg-[#00FF9D]/10 text-[#00FF9D]' 
                    : 'border-white/10 hover:border-white/30 text-white/70'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="text-[#9C27B0]" size={20} />
            <h2 className="text-lg font-bold">
              {lang === 'ar' ? 'المظهر' : 'Theme'}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  theme === t.id 
                    ? 'border-[#9C27B0] bg-[#9C27B0]/10' 
                    : 'border-white/10 hover:border-white/30 text-white/70'
                }`}
              >
                <span className={theme === t.id ? 'text-[#9C27B0] font-bold' : ''}>
                  {lang === 'ar' && t.id === 'dark' ? 'الوضع الداكن' : 
                   lang === 'ar' && t.id === 'light' ? 'الوضع الفاتح' : 
                   lang === 'ar' && t.id === 'golden' ? 'الوضع الذهبي' : 
                   t.label}
                </span>
                <div 
                  className="w-6 h-6 rounded-full border border-white/20" 
                  style={{ backgroundColor: t.color }}
                />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
