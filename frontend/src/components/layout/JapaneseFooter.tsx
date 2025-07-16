import Link from 'next/link';

const JapaneseFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'サービス',
      links: [
        { name: 'ホーム', href: '/ja' },
        { name: '商品検索', href: '/ja/search' },
        { name: 'カテゴリー', href: '/ja/tags' },
        { name: 'ランキング', href: '/ja/search?sort=popular' },
        { name: 'セール情報', href: '/ja/search?sale=true' },
      ]
    },
    {
      title: '人気カテゴリー',
      links: [
        { name: '家電', href: '/ja/tags/家電' },
        { name: 'ファッション', href: '/ja/tags/ファッション' },
        { name: '美容・コスメ', href: '/ja/tags/美容' },
        { name: 'スポーツ用品', href: '/ja/tags/スポーツ' },
        { name: '本・雑誌', href: '/ja/tags/本' },
        { name: 'ゲーム・おもちゃ', href: '/ja/tags/ゲーム' },
      ]
    },
    {
      title: '便利ツール',
      links: [
        { name: 'Amazon割引検索', href: '/ja/search?source=amazon&discount=true' },
        { name: '楽天市場検索', href: '/ja/search?source=rakuten' },
        { name: '価格比較', href: '/ja/compare' },
        { name: 'お気に入り', href: '/ja/favorites' },
        { name: '検索履歴', href: '/ja/history' },
      ]
    },
    {
      title: 'サポート',
      links: [
        { name: 'サイトについて', href: '/ja/about' },
        { name: '使い方ガイド', href: '/ja/help' },
        { name: 'よくある質問', href: '/ja/faq' },
        { name: 'お問い合わせ', href: '/ja/contact' },
        { name: 'フィードバック', href: '/ja/feedback' },
      ]
    }
  ];

  const legalLinks = [
    { name: '利用規約', href: '/ja/terms' },
    { name: 'プライバシーポリシー', href: '/ja/privacy' },
    { name: '特定商取引法に基づく表記', href: '/ja/tokushohou' },
    { name: 'サイトマップ', href: '/ja/sitemap' },
  ];

  const storeLinks = [
    { name: 'Amazon', href: 'https://amazon.co.jp', color: 'text-orange-600' },
    { name: '楽天市場', href: 'https://rakuten.co.jp', color: 'text-red-600' },
    { name: 'Yahoo!ショッピング', href: 'https://shopping.yahoo.co.jp', color: 'text-purple-600' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Store Information */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">提携ショップ</h3>
            <div className="flex justify-center space-x-8 mb-4">
              {storeLinks.map((store) => (
                <a
                  key={store.name}
                  href={store.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${store.color} hover:underline font-medium`}
                >
                  {store.name}
                </a>
              ))}
            </div>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              本サイトは各ショップの商品情報を集約し、価格比較サービスを提供しています。
              実際の購入は各ショップのサイトで行われます。
            </p>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-gray-700 pt-6 mb-6">
          <div className="flex flex-wrap justify-center space-x-6">
            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm mb-2"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright and Disclaimers */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <div className="mb-4">
            <div className="text-2xl font-bold text-blue-400 mb-2">Rakurabu.com</div>
            <p className="text-gray-400 text-sm">楽して比べる価格比較サイト</p>
          </div>
          
          <p className="text-sm text-gray-400 mb-2">
            &copy; {currentYear} Rakurabu.com（ラクラブ） All rights reserved.
          </p>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              ※商品価格や在庫状況は各ショップの情報を元にしており、リアルタイムで更新されています。
            </p>
            <p>
              ※本サイトは商品の仲介は行わず、各ショップへのリンクを提供するサービスです。
            </p>
            <p>
              ※価格情報は参考目安であり、実際の価格は各ショップでご確認ください。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default JapaneseFooter;
