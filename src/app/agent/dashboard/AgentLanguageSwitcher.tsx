// src/app/agent/dashboard/AgentLanguageSwitcher.tsx
'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function AgentLanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'uz', name: 'O‘zbekcha', flag: '🇺🇿' }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Кнопка теперь выглядит так же, как на странице анкеты */}
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{currentLanguage?.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLocale(language.code)}
            className={`flex items-center gap-2 cursor-pointer ${locale === language.code ? 'bg-accent' : ''}`}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}