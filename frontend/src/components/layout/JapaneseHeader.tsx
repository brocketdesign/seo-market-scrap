'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const JapaneseHeader = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && isMounted) {
      router.push(`/ja/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navigationItems = [
    { name: 'ホーム', href: '/ja' },
    { name: '商品検索', href: '/ja/search' },
    { name: 'カテゴリー', href: '/ja/tags' },
    { name: 'ランキング', href: '/ja/search?sort=popular' },
    { name: 'セール情報', href: '/ja/search?sale=true' },
  ];

  const quickCategories = [
    { name: '家電', href: '/ja/search?q=家電' },
    { name: 'ファッション', href: '/ja/search?q=ファッション' },
    { name: '美容・コスメ', href: '/ja/search?q=美容' },
    { name: 'スポーツ', href: '/ja/search?q=スポーツ' },
    { name: '本・雑誌', href: '/ja/search?q=本' },
    { name: 'ゲーム', href: '/ja/search?q=ゲーム' },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex space-x-4">
              <Link href="/ja/about" className="hover:underline">サイトについて</Link>
              <Link href="/ja/help" className="hover:underline">使い方</Link>
              <Link href="/ja/contact" className="hover:underline">お問い合わせ</Link>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/" className="hover:underline text-xs">English</Link>
              <span className="text-xs">|</span>
              <span className="text-xs font-medium">日本語</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/ja" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">
              Rakurabu.com
            </div>
            <div className="text-xs text-gray-500 hidden sm:block">
              楽して比べる価格比較サイト
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            {isMounted && (
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="商品名やキーワードを入力"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 pr-12"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                >
                  検索
                </button>
              </form>
            )}
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          {isMounted && (
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="商品名やキーワードを入力"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 pr-12"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
              >
                検索
              </button>
            </form>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-gray-50 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Quick Categories Bar */}
      <div className="bg-gray-50 border-t hidden lg:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-6 text-sm">
            <span className="text-gray-600 font-medium">人気カテゴリー:</span>
            {quickCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => {
                  router.push(category.href);
                }}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default JapaneseHeader;
