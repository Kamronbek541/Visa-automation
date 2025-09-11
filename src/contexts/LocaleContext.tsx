// 'use client';

// import React, { createContext, useContext, useState, useEffect } from 'react';

// interface LocaleContextType {
//   locale: string;
//   setLocale: (locale: string) => void;
// }

// const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// export function LocaleProvider({ children }: { children: React.ReactNode }) {
//   const [locale, setLocale] = useState('en');

//   // Сохраняем локаль в localStorage
//   useEffect(() => {
//     const savedLocale = localStorage.getItem('locale');
//     if (savedLocale) {
//       setLocale(savedLocale);
//     }
//   }, []);

//   const updateLocale = (newLocale: string) => {
//     setLocale(newLocale);
//     localStorage.setItem('locale', newLocale);
//   };

//   return (
//     <LocaleContext.Provider value={{ locale, setLocale: updateLocale }}>
//       {children}
//     </LocaleContext.Provider>
//   );
// }

// export function useLocaleContext() {
//   const context = useContext(LocaleContext);
//   if (context === undefined) {
//     throw new Error('useLocaleContext must be used within a LocaleProvider');
//   }
//   return context;
// }


'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    // Загружаем сохраненную локаль из localStorage при монтировании
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  const updateLocale = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale: updateLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocaleContext must be used within a LocaleProvider');
  }
  return context;
}