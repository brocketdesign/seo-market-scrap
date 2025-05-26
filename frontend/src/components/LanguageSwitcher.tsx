'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { type Locale, getLocaleFromPathname, getOppositeLocale, getDictionary } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const dict = getDictionary(currentLocale);
  const oppositeLocale = getOppositeLocale(currentLocale);
  const oppositeDict = getDictionary(oppositeLocale);
  
  const handleLanguageSwitch = () => {
    const { pathWithoutLocale } = getLocaleFromPathname(pathname);
    
    let newPath: string;
    if (oppositeLocale === 'ja') {
      newPath = `/ja${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    } else {
      newPath = pathWithoutLocale;
    }
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white hover:text-gray-300 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentLocale === 'en' ? '🇺🇸' : '🇯🇵'}</span>
        <span>{currentLocale === 'en' ? 'EN' : 'JA'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <button
            onClick={handleLanguageSwitch}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span>{oppositeLocale === 'en' ? '🇺🇸' : '🇯🇵'}</span>
              <span>
                {oppositeLocale === 'en' 
                  ? oppositeDict.switchToEnglish 
                  : oppositeDict.switchToJapanese
                }
              </span>
            </div>
          </button>
        </div>
      )}
      
      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
