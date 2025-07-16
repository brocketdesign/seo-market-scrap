'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JapaneseHomePageSimple() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && isMounted) {
      router.push(`/ja/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: "総合", href: "/ja/tags/総合", icon: "🛍️" },
    { name: "ファッション", href: "/ja/tags/ファッション", icon: "👕" },
    { name: "食品", href: "/ja/tags/食品", icon: "🍎" },
    { name: "家電", href: "/ja/tags/家電", icon: "🔌" },
    { name: "美容・コスメ", href: "/ja/tags/美容", icon: "💄" },
    { name: "スポーツ用品", href: "/ja/tags/スポーツ", icon: "⚽" },
  ];

  const popularKeywords = [
    "ハンディファン", "扇風機", "冷却プレート", "ネッククーラー", "ロボット掃除機",
    "脱毛器", "美容器", "スマートウォッチ", "ワイヤレスイヤホン", "モバイルバッテリー",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            大手通販サイトのあらゆる商品の価格を比較、最安値を検索！
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
            まずはお好きなキーワードや商品名を入力して探してみましょう
          </p>
          
          {/* Search Bar */}
          {isMounted && (
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="商品名検索"
                  className="w-full px-6 py-4 text-lg border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 pr-16"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  検索
                </button>
              </div>
            </form>
          )}

          {/* Store Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="text-sm text-gray-600 mb-2 w-full">セール情報を探す</div>
            <Link href="/ja/search?source=rakuten" className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors">
              楽天市場
            </Link>
            <Link href="/ja/search?source=amazon" className="bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 transition-colors">
              Amazon
            </Link>
            <Link href="/ja/search?source=yahoo" className="bg-purple-100 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-200 transition-colors">
              Yahoo!
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">
            カテゴリーから探す
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center group"
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Keywords Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">
            人気キーワードから探す
          </h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {popularKeywords.map((keyword) => (
              <Link
                key={keyword}
                href={`/ja/search?q=${encodeURIComponent(keyword)}`}
                className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Block */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">
              なぜ私たちのサービスを選ぶのか？
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                AmazonやRakutenの膨大なオンラインマーケットプレイスをナビゲートするのは圧倒的かもしれません。
                私たちのプラットフォームは、トップ評価の商品をキュレーションし、詳細な比較を提供し、
                最高のお得な情報をハイライトすることで、あなたのショッピング体験を簡素化します。
              </p>
              <p>
                SEOのベストプラクティスへの取り組みにより、関連する商品情報を迅速かつ効率的に見つけることができます。
                発見から決定までの旅を向上させる、高速でユーザーフレンドリーなインターフェースの提供に焦点を当てています。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
