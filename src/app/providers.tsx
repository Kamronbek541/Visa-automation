// 'use client';
// import { SessionProvider } from 'next-auth/react';

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return <SessionProvider>{children}</SessionProvider>;
// }

// 'use client';

// import { NextIntlClientProvider } from 'next-intl';
// import { useRouter } from 'next/navigation';
// import { useLocale } from 'next-intl';

// export default function Providers({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const locale = useLocale();

//   return (
//     <NextIntlClientProvider
//       locale={locale}
//       messages={require(`../../messages/${locale}.json`)}
//       onError={(error) => {
//         // Обработка ошибок i18n
//         console.error('i18n error:', error);
//       }}
//     >
//       {children}
//     </NextIntlClientProvider>
//   );
// }

// 'use client';

// import { NextIntlClientProvider } from 'next-intl';

// export default function Providers({ 
//   children, 
//   locale,
//   messages 
// }: { 
//   children: React.ReactNode;
//   locale: string;
//   messages: any;
// }) {
//   return (
//     <NextIntlClientProvider
//       locale={locale}
//       messages={messages}
//     >
//       {children}
//     </NextIntlClientProvider>
//   );
// }


// 'use client';

// import { NextIntlClientProvider } from 'next-intl';

// export default function Providers({ 
//   children, 
//   locale,
//   messages 
// }: { 
//   children: React.ReactNode;
//   locale: string;
//   messages: any;
// }) {
//   return (
//     <NextIntlClientProvider
//       locale={locale}
//       messages={messages}
//       onError={(error) => {
//         // Игнорируем ошибки перевода в production
//         if (process.env.NODE_ENV === 'development') {
//           console.error(error);
//         }
//       }}
//     >
//       {children}
//     </NextIntlClientProvider>
//   );
// }


// 'use client';

// import { NextIntlClientProvider } from 'next-intl';
// import { useState, useEffect } from 'react';

// export default function Providers({ 
//   children 
// }: { 
//   children: React.ReactNode;
// }) {
//   const [locale, setLocale] = useState('en');
//   const [messages, setMessages] = useState<any>(null);

//   useEffect(() => {
//     // Загружаем сообщения для текущей локали
//     const loadMessages = async () => {
//       try {
//         const messages = await import(`../../messages/${locale}.json`);
//         setMessages(messages.default);
//       } catch (error) {
//         console.error('Failed to load messages:', error);
//       }
//     };

//     loadMessages();
//   }, [locale]);

//   if (!messages) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <NextIntlClientProvider
//       locale={locale}
//       messages={messages}
//     >
//       {children}
//     </NextIntlClientProvider>
//   );
// }


// 'use client';

// import { NextIntlClientProvider } from 'next-intl';
// import { LocaleProvider, useLocaleContext } from './LocaleContext';
// import { useEffect, useState } from 'react';

// function IntlProvider({ children }: { children: React.ReactNode }) {
//   const { locale } = useLocaleContext();
//   const [messages, setMessages] = useState<any>(null);

//   useEffect(() => {
//     const loadMessages = async () => {
//       try {
//         const messages = await import(`../../messages/${locale}.json`);
//         setMessages(messages.default);
//       } catch (error) {
//         console.error('Failed to load messages:', error);
//       }
//     };

//     loadMessages();
//   }, [locale]);

//   if (!messages) {
//     return <div>Loading translations...</div>;
//   }

//   return (
//     <NextIntlClientProvider locale={locale} messages={messages}>
//       {children}
//     </NextIntlClientProvider>
//   );
// }

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <LocaleProvider>
//       <IntlProvider>
//         {children}
//       </IntlProvider>
//     </LocaleProvider>
//   );
// }


'use client';

import { NextIntlClientProvider } from 'next-intl';
import { LocaleProvider, useLocaleContext } from '@/contexts/LocaleContext';
import { useEffect, useState } from 'react';

function IntlProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocaleContext();
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messages = await import(`../../messages/${locale}.json`);
        setMessages(messages.default);
      } catch (error) {
        console.error('Failed to load messages:', error);
        // Загружаем fallback сообщения
        const fallbackMessages = await import(`../../messages/en.json`);
        setMessages(fallbackMessages.default);
      }
    };

    loadMessages();
  }, [locale]);

  if (!messages) {
    return <div className="p-4">Loading translations...</div>;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <IntlProvider>
        {children}
      </IntlProvider>
    </LocaleProvider>
  );
}