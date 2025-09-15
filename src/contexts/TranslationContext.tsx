// // src/contexts/TranslationContext.tsx
// 'use client';

// // import React, { createContext, useContext, useState, ReactNode } from 'react';
// import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// import Cookies from 'js-cookie';
// import { useRouter } from 'next/navigation';
// import enMessages from '../../messages/en.json';
// import ruMessages from '../../messages/ru.json';
// import uzMessages from '../../messages/uz.json';

// type Messages = typeof enMessages;
// type Locale = 'en' | 'ru' | 'uz';

// // ИСПРАВЛЕНИЕ: Используем правильные имена
// const translations: Record<Locale, Messages> = {
//   en: enMessages,
//   ru: ruMessages,
//   uz: uzMessages,
// };

// const TranslationContext = createContext({
//   locale: 'en' as Locale,
//   setLocale: (locale: Locale) => {},
//   t: (key: keyof Messages, variables?: Record<string, any>) => key as string,
// });

// // export const TranslationProvider = ({ children }: { children: ReactNode }) => {
// //   const router = useRouter();
// //   const [locale, _setLocale] = useState<Locale>(() => {
// //     const cookieLocale = Cookies.get('locale');
// //     return (cookieLocale && ['en', 'ru', 'uz'].includes(cookieLocale) ? cookieLocale : 'en') as Locale;
// //   });

// //   const setLocale = (newLocale: Locale) => {
// //     Cookies.set('locale', newLocale, { expires: 365, path: '/' });
// //     _setLocale(newLocale);
// //     router.refresh();
// //   };

// //   const t = (key: keyof Messages, variables?: Record<string, any>): string => {

// export const TranslationProvider = ({ children }: { children: ReactNode }) => {
//     const router = useRouter();
//     const [locale, _setLocale] = useState<Locale>(() => {
//       const cookieLocale = Cookies.get('locale');
//       return (cookieLocale && ['en', 'ru', 'uz'].includes(cookieLocale) ? cookieLocale : 'en') as Locale;
//     });
  
//     // ==========================================================
//     // НОВЫЙ БЛОК: СИНХРОНИЗАЦИЯ ЯЗЫКА С HTML
//     // ==========================================================
//     useEffect(() => {
//       // Когда `locale` меняется, мы обновляем атрибут `lang` у тега <html>
//       document.documentElement.lang = locale;
//     }, [locale]);
//     // ==========================================================
  
//     const setLocale = (newLocale: Locale) => {
//       Cookies.set('locale', newLocale, { expires: 365, path: '/' });
//       _setLocale(newLocale);
//       router.refresh();
//     };
  
//     const t = (key: keyof Messages, variables?: Record<string, any>): string => {
//     // Улучшенная логика для `t`
//     const message = translations[locale]?.[key] || translations['en']?.[key] || String(key);
//     if (!variables) return message;
    
//     return Object.entries(variables).reduce((acc, [varKey, value]) => {
//       return acc.replace(`{${varKey}}`, String(value));
//     }, message);
//   };

// //   return (
// //     <TranslationContext.Provider value={{ locale, setLocale, t }}>
// //       {children}
// //     </TranslationContext.Provider>
// //   );
// // };

// // export const useTranslation = () => useContext(TranslationContext);

// return (
//     <TranslationContext.Provider value={{ locale, setLocale, t }}>
//       {children}
//     </TranslationContext.Provider>
//   );
// };

// export const useTranslation = () => useContext(TranslationContext);


// src/contexts/TranslationContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import enMessages from '../../messages/en.json';
import ruMessages from '../../messages/ru.json';
import uzMessages from '../../messages/uz.json';

type Messages = typeof enMessages;
type Locale = 'en' | 'ru' | 'uz';

const translations: Record<Locale, Messages> = {
  en: enMessages,
  ru: ruMessages,
  uz: uzMessages,
};

const TranslationContext = createContext({
  locale: 'en' as Locale,
  setLocale: (locale: Locale) => {},
  t: (key: keyof Messages, variables?: Record<string, any>) => key as string,
});

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [locale, _setLocale] = useState<Locale>(() => {
    const cookieLocale = Cookies.get('locale');
    return (cookieLocale && ['en', 'ru', 'uz'].includes(cookieLocale) ? cookieLocale : 'en') as Locale;
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    Cookies.set('locale', newLocale, { expires: 365, path: '/' });
    _setLocale(newLocale);
    router.refresh();
  };

  const t = (key: keyof Messages, variables?: Record<string, any>): string => {
    const message = translations[locale]?.[key] || translations['en']?.[key] || String(key);
    if (!variables) return message;
    return Object.entries(variables).reduce((acc, [varKey, value]) => {
      return acc.replace(`{${varKey}}`, String(value));
    }, message);
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);