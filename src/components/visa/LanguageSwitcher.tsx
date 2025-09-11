// 'use client';

// import { useRouter } from 'next/navigation';
// import { useLocale } from 'next-intl';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Globe } from 'lucide-react';

// export default function LanguageSwitcher() {
//   const router = useRouter();
//   const locale = useLocale();

//   const languages = [
//     { code: 'en', name: 'English', flag: '🇺🇸' },
//     { code: 'ru', name: 'Русский', flag: '🇷🇺' },
//     { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' }
//   ];

//   const changeLanguage = (newLocale: string) => {
//     // Обновляем URL с новой локалью
//     const pathname = window.location.pathname;
//     const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
//     router.push(newPathname);
//     router.refresh(); // Обновляем страницу
//   };

//   const currentLanguage = languages.find(lang => lang.code === locale);

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="outline" size="sm" className="flex items-center gap-2">
//           <Globe className="h-4 w-4" />
//           {currentLanguage?.flag} {currentLanguage?.name}
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         {languages.map((language) => (
//           <DropdownMenuItem
//             key={language.code}
//             onClick={() => changeLanguage(language.code)}
//             className="flex items-center gap-2"
//           >
//             <span>{language.flag}</span>
//             <span>{language.name}</span>
//           </DropdownMenuItem>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }



'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useLocaleContext } from '@/contexts/LocaleContext';

export default function VisaLanguageSwitcher() {
  const { locale, setLocale } = useLocaleContext();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {currentLanguage?.flag}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLocale(language.code)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}