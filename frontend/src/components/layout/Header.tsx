'use client';

import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Header = () => {
  const { locale, dict } = useLocale();
  
  // Determine the base path for navigation links
  const basePath = locale === 'ja' ? '/ja' : '';
  
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center">
        <Link href={basePath || '/'} className="text-2xl font-bold hover:text-gray-300 transition-colors">
          SEO Product Aggregator
        </Link>
        <div className="flex items-center space-x-6">
          <nav className="mt-4 md:mt-0">
            <ul className="flex space-x-4 md:space-x-6">
              <li>
                <Link href={basePath || '/'} className="hover:text-gray-300 transition-colors">
                  {dict.home}
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/search`} className="hover:text-gray-300 transition-colors">
                  {dict.search}
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/tags/electronics`} className="hover:text-gray-300 transition-colors">
                  {dict.electronics}
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/tags/books`} className="hover:text-gray-300 transition-colors">
                  {dict.books}
                </Link>
              </li>
              {/* Example Admin Link - to be conditionally rendered later based on auth */}
              {/* <li>
                <Link href="/admin/dashboard" className="hover:text-gray-300 transition-colors">
                  Admin
                </Link>
              </li> */}
            </ul>
          </nav>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
};

export default Header;
