'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface Product {
  _id: string;
  title: string;
  price: string;
  images: string[];
  source: string;
  ratings?: {
    value: number;
    count: number;
  };
  contentLanguage: string;
}

export default function JapaneseHomePage() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    if (!isMounted) return;
    
    const fetchProducts = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        // Fetch only Japanese products
        const response = await fetch(`${apiBaseUrl}/api/products/public?limit=8&sort=featured&contentLanguage=japanese`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setFeaturedProducts(data.products);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching products');
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isMounted]);

  const categories = [
    { name: "総合", href: "/ja/tags/総合", icon: "🛍️" },
    { name: "ファッション", href: "/ja/tags/ファッション", icon: "👕" },
    { name: "食品", href: "/ja/tags/食品", icon: "🍎" },
    { name: "アウトドア・釣り・旅行用品", href: "/ja/tags/アウトドア", icon: "🏕️" },
    { name: "ダイエット・健康グッズ", href: "/ja/tags/健康", icon: "💪" },
    { name: "コスメ・美容・ヘアケア", href: "/ja/tags/美容", icon: "💄" },
    { name: "スマホ・タブレット・パソコン", href: "/ja/tags/デジタル", icon: "📱" },
    { name: "テレビ・オーディオ・カメラ", href: "/ja/tags/家電", icon: "📺" },
    { name: "家電", href: "/ja/tags/家電", icon: "🔌" },
    { name: "家具・インテリア用品", href: "/ja/tags/インテリア", icon: "🪑" },
    { name: "花・ガーデニング用品", href: "/ja/tags/ガーデニング", icon: "🌻" },
    { name: "キッチン・日用品・文具", href: "/ja/tags/キッチン", icon: "🍴" },
    { name: "DIY・工具", href: "/ja/tags/DIY", icon: "🔧" },
    { name: "ペット用品・生き物", href: "/ja/tags/ペット", icon: "🐶" },
    { name: "楽器・手芸・コレクション", href: "/ja/tags/趣味", icon: "🎸" },
    { name: "ゲーム・おもちゃ", href: "/ja/tags/ゲーム", icon: "🎮" },
    { name: "ベビー・キッズ・マタニティ", href: "/ja/tags/ベビー", icon: "👶" },
    { name: "スポーツ用品", href: "/ja/tags/スポーツ", icon: "⚽" },
    { name: "車・バイク・自転車", href: "/ja/tags/自動車", icon: "🚗" },
    { name: "CD・音楽ソフト", href: "/ja/tags/音楽", icon: "🎵" },
    { name: "DVD・映像ソフト", href: "/ja/tags/映像", icon: "📀" },
    { name: "本・雑誌・コミック", href: "/ja/tags/本", icon: "📚" },
  ];

  const popularKeywords = [
    "ハンディファン", "扇風機", "冷却プレート", "ネッククーラー", "ロボット掃除機",
    "脱毛器", "美容器", "スマートウォッチ", "ワイヤレスイヤホン", "モバイルバッテリー",
    "空気清浄機", "加湿器", "電動歯ブラシ", "マッサージ器", "体重計"
  ];

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            楽して比べる、最安値を見つける
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
            Rakurabu.com（ラクラブ）なら、Amazon・楽天市場・Yahoo!ショッピングの商品価格を一括比較。お探しの商品の最安値を簡単に見つけられます。
          </p>
          
          {/* Search Bar */}
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

          {/* Store Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="text-sm text-gray-600 mb-2">セール情報を探す</div>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center group"
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600 leading-tight">
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

      {/* Featured Products Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">
            人気ランキング（カテゴリー別）
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-md mb-2 animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-100 p-4 rounded-md text-red-700 text-center">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <Link 
                  key={product._id} 
                  href={`/ja/products/${product._id}`}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow relative"
                >
                  {/* Ranking Badge */}
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {index + 1}位
                  </div>
                  
                  <div className="w-full h-48 bg-gray-100 rounded-md mb-4 overflow-hidden relative">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.source === 'amazon' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.source === 'amazon' ? 'Amazon' : '楽天市場'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-3 leading-tight">{product.title}</h3>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-600 text-lg">{product.price}</span>
                    {product.ratings && (
                      <div className="flex items-center">
                        <div className="text-amber-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                          </svg>
                        </div>
                        <span className="ml-1 text-xs text-gray-600">{product.ratings.value}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link
              href="/ja/search?sort=featured"
              className="text-blue-600 hover:underline font-medium"
            >
              カテゴリー別ランキングを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Additional Tools Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Amazon Discount Search */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Amazonの割引商品を探す</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Amazonの割引商品を簡単に探すことのできる検索機能です。
              </p>
              <Link
                href="/ja/search?source=amazon&discount=true"
                className="inline-block bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                割引商品を探す
              </Link>
            </div>

            {/* Line Chat Bot */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">便利ツールで最安値を検索</h3>
              <p className="text-gray-600 mb-4 text-sm">
                いつでもどこでも最安値を検索できる便利なツールをご利用ください。
              </p>
              <Link
                href="/ja/search"
                className="inline-block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                検索ツールを使う
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Block */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800 text-center">
              なぜ私たちのサービスを選ぶのか？
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-gray-700">
              <div>
                <p className="mb-4">
                  AmazonやRakutenの膨大なオンラインマーケットプレイスをナビゲートするのは圧倒的かもしれません。
                  私たちのプラットフォームは、トップ評価の商品をキュレーションし、詳細な比較を提供し、
                  最高のお得な情報をハイライトすることで、あなたのショッピング体験を簡素化します。
                </p>
                <p>
                  SEOのベストプラクティスへの取り組みにより、関連する商品情報を迅速かつ効率的に見つけることができます。
                </p>
              </div>
              <div>
                <p className="mb-4">
                  発見から決定までの旅を向上させる、高速でユーザーフレンドリーなインターフェースの提供に焦点を当てています。
                </p>
                <p>
                  価格比較から商品レビューまで、最適な購入決定を下すために必要なすべての情報を一箇所で提供します。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
