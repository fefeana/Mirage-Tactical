import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { translations as defaultTranslations, reviewsTranslations as defaultReviews } from './translations';
import { onAuthStateChanged } from 'firebase/auth';

export interface LanguageData {
  ui: Record<string, string>;
  reviews: { id: string; user: string; text: string; aiReply: string }[];
}

let globalTranslationsCache: Record<string, Record<string, string>> = {};
let lastJsonUpdate = 0;

export function useTranslations(appLanguage: string) {
  const [translationsCache, setTranslationsCache] = useState<Record<string, LanguageData>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isJsonLoaded, setIsJsonLoaded] = useState(false);

  // Load translations.json globally
  useEffect(() => {
    const fetchGlobalTranslationsJson = async () => {
      const now = Date.now();
      if (Object.keys(globalTranslationsCache).length === 0 || (now - lastJsonUpdate) > 3600000) {
        try {
          const response = await fetch('/translations.json');
          if (response.ok) {
            const data = await response.json();
            if (data) {
              globalTranslationsCache = data;
              lastJsonUpdate = now;
              setIsJsonLoaded(true);
            }
          }
        } catch (error) {
          console.error("Error fetching translations.json", error);
        }
      } else {
        setIsJsonLoaded(true); // Already loaded
      }
    };
    fetchGlobalTranslationsJson();
  }, [appLanguage]);

  // Check admin status to enable seeding
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.email === 'alfacc222@gmail.com' || user.email === 'fmsea19@gmail.com') {
          setIsAdmin(true);
        } else {
           try {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists() && userDoc.data().role === 'admin') {
                setIsAdmin(true);
              }
           } catch (e) {
             console.log("Not an admin or permission denied reading user doc");
           }
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const syncToCloud = async () => {
    if (!isAdmin) return;
    try {
      const langs = Object.keys(defaultTranslations);
      for (const lang of langs) {
        const langData = {
          ui: defaultTranslations[lang],
          reviews: defaultReviews[lang] || defaultReviews['English']
        };
        await setDoc(doc(db, 'languages', lang), langData, { merge: true });
      }
      console.log('✅ ALL Translations Synced to Cloud!');
    } catch (error) {
      console.error('Failed to sync translations:', error);
    }
  };

  useEffect(() => {
    const langsRef = collection(db, 'languages');
    const unsubscribe = onSnapshot(langsRef, (snapshot) => {
       if (snapshot.empty) {
          console.log("No translations found in cloud, applying local fallback...");
          return;
       }
       const newCache: Record<string, LanguageData> = {};
       let updateCount = 0;
       snapshot.forEach((docSnap) => {
         if (docSnap.exists()) {
            newCache[docSnap.id] = docSnap.data() as LanguageData;
            updateCount++;
         }
       });
       if (updateCount > 0) {
          setTranslationsCache(prev => ({ ...prev, ...newCache }));
       }
    }, (error) => {
       console.error(`Error syncing translations: ${error.message}`);
    });
    return () => unsubscribe();
  }, []);

  const getLanguageCode = (langName: string) => {
    const map: Record<string, string> = {
      'Arabic (العربية)': 'ar', 'English': 'en', 'French (Français)': 'fr',
      'Turkish (Türkçe)': 'tr', 'Spanish (Español)': 'es', 'German (Deutsch)': 'de',
      'Russian (Русский)': 'ru', 'Chinese (中文)': 'zh', 'Japanese (日本語)': 'ja',
      'Hindi (हिन्दी)': 'hi', 'Italian (Italiano)': 'it', 'Portuguese (Português)': 'pt',
      'Dutch': 'nl', 'Swedish': 'sv', 'Norwegian': 'no', 'Finnish': 'fi',
      'Polish': 'pl', 'Czech': 'cs', 'Greek': 'el', 'Korean (한국어)': 'ko',
      'Indonesian': 'id', 'Malay': 'ms', 'Thai': 'th', 'Vietnamese (Tiếng Việt)': 'vi',
      'Ukrainian': 'uk', 'Romanian': 'ro', 'Bulgarian': 'bg', 'Serbian': 'sr',
      'Croatian': 'hr', 'Slovak': 'sk', 'Hungarian': 'hu', 'Persian': 'fa',
      'Urdu': 'ur', 'Bengali': 'bn', 'Tamil': 'ta', 'Telugu': 'te',
      'Malayalam': 'ml', 'Swahili': 'sw', 'Hebrew': 'he', 'Azerbaijani': 'az'
    };
    return map[langName] || 'en';
  };

  const getTranslation = (lang: string) => {
    const langCode = getLanguageCode(lang);
    
    // Base translations
    let combined = { ...defaultTranslations['English'] };
    
    // 1. Local fallback
    if (defaultTranslations[lang]) {
       combined = { ...combined, ...defaultTranslations[lang] };
    }
    
    // 2. Cloud Firetore translations
    if (translationsCache[lang]?.ui) {
       combined = { ...combined, ...translationsCache[lang].ui };
    }
    
    // 3. Global translations.json mapping
    if (globalTranslationsCache) {
       if (globalTranslationsCache['btn_connect']?.[langCode]) combined['connect'] = globalTranslationsCache['btn_connect'][langCode];
       if (globalTranslationsCache['lbl_speed']?.[langCode]) {
         combined['ping'] = globalTranslationsCache['lbl_speed'][langCode];
       }
       if (globalTranslationsCache['settings']?.[langCode]) combined['settings'] = globalTranslationsCache['settings'][langCode];
       if (globalTranslationsCache['ghost_mode']?.[langCode]) combined['ghostMode'] = globalTranslationsCache['ghost_mode'][langCode];
    }
    
    return combined;
  };

  const getLocalizedReviewsData = (lang: string) => {
    if (translationsCache[lang]?.reviews) {
      return translationsCache[lang].reviews;
    }
    const cloudKey = Object.keys(translationsCache).find(k => lang.includes(k.split(' ')[0]));
    if (cloudKey && translationsCache[cloudKey]?.reviews) {
      return translationsCache[cloudKey].reviews;
    }
    if (defaultReviews[lang]) {
      return defaultReviews[lang];
    }
    const localKey = Object.keys(defaultReviews).find(k => lang.includes(k.split(' ')[0]));
    if (localKey && defaultReviews[localKey]) {
      return defaultReviews[localKey];
    }
    return defaultReviews['English'];
  };

  return { getTranslation, getLocalizedReviewsData, syncToCloud, isAdmin, translationsCache, isJsonLoaded };
}
