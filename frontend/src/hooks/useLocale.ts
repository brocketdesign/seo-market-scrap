'use client';

import { usePathname } from 'next/navigation';
import { getLocaleFromPathname, type Locale, getDictionary } from '@/lib/i18n';

export function useLocale(): { locale: Locale; dict: ReturnType<typeof getDictionary> } {
  const pathname = usePathname();
  const { locale } = getLocaleFromPathname(pathname);
  const dict = getDictionary(locale);
  
  return { locale, dict };
}
