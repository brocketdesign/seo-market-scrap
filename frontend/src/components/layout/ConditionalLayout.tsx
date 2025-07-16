'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import JapaneseHeader from './JapaneseHeader';
import JapaneseFooter from './JapaneseFooter';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isJapanesePage = pathname?.startsWith('/ja');

  if (isJapanesePage) {
    return (
      <>
        <JapaneseHeader />
        <main className="flex-grow">
          {children}
        </main>
        <JapaneseFooter />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto p-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
