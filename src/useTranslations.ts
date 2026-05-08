import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { translations as defaultTranslations, reviewsTranslations as defaultReviews } from './translations';
import { onAuthStateChanged } from 'firebase/auth';

export interface LanguageData {
  ui: Record<string, string>;
  reviews: { id: string; user: string; text: string; aiReply: string }[];
}

export function useTranslations(appLanguage: string) {
  const [translationsCache, setTranslationsCache] = useState<Record<string, LanguageData>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status to enable seeding
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Evaluate if user is admin per our firestore rules matching (or just let the backend decide)
        // A simple way is to check the user email against our known admin email or try writing
        if (user.email === 'alfacc222@gmail.com' || user.email === 'fmsea19@gmail.com') {
          setIsAdmin(true);
        } else {
           // Also check custom claims or db role if implemented, but email is enough for seeding
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

  // Sync to Cloud function (triggered by admin)
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

  // Subscribe to Cloud Translations
  useEffect(() => {
    const langsRef = collection(db, 'languages');
    
    // Robust Snapshot Listener (Mirage Protocol)
    const unsubscribe = onSnapshot(langsRef, (snapshot) => {
       // 1. Error handling is caught by the 2nd argument of onSnapshot automatically in JS/TS
       // but we handle the "no data" condition explicitly.
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
          console.log(`Languages updated: ${updateCount} from cloud`);
       } else {
          console.log("No valid translation documents found, applying fallback...");
       }
    }, (error) => {
       // Break Condition / Error Handling
       console.error(`Error syncing translations: ${error.message}`);
       // Fallback is automatically applied because translationsCache remains unchanged
    });

    return () => unsubscribe();
  }, []);

  // Helper to get text
  const getTranslation = (lang: string) => {
    // 1. Try Cloud
    if (translationsCache[lang]?.ui) {
       return { ...defaultTranslations['English'], ...translationsCache[lang].ui };
    }
    // 2. Try Local fallback
    if (defaultTranslations[lang]) {
       return { ...defaultTranslations['English'], ...defaultTranslations[lang] };
    }
    // 3. Fallback to English
    return defaultTranslations['English'];
  };

  const getLocalizedReviewsData = (lang: string) => {
    // 1. Try Cloud exact match
    if (translationsCache[lang]?.reviews) {
      return translationsCache[lang].reviews;
    }
    // 2. Try Cloud inexact match
    const cloudKey = Object.keys(translationsCache).find(k => lang.includes(k.split(' ')[0]));
    if (cloudKey && translationsCache[cloudKey]?.reviews) {
      return translationsCache[cloudKey].reviews;
    }
    
    // 3. Try Local exact match
    if (defaultReviews[lang]) {
      return defaultReviews[lang];
    }
    // 4. Try Local inexact match
    const localKey = Object.keys(defaultReviews).find(k => lang.includes(k.split(' ')[0]));
    if (localKey && defaultReviews[localKey]) {
      return defaultReviews[localKey];
    }

    // 5. Fallback English
    return defaultReviews['English'];
  };

  return { getTranslation, getLocalizedReviewsData, syncToCloud, isAdmin, translationsCache };
}
