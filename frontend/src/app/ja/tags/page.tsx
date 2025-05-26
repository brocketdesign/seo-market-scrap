import Link from 'next/link';
import type { Metadata } from 'next';
import { getDictionary } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'すべてのタグを閲覧 | SEO Product Aggregator',
  description: 'タグとカテゴリで商品カタログを探索してください。タイプ、用途、ブランドなどで整理された商品を見つけてください。',
  keywords: ['商品タグ', 'カテゴリ閲覧', '商品カテゴリ', '商品タイプ', 'ショッピングカテゴリ'],
  openGraph: {
    title: 'すべてのタグを閲覧 | SEO Product Aggregator',
    description: 'タグとカテゴリで商品カタログを探索してください。',
    type: 'website',
  },
};

export default function JapaneseTagsPage() {
  const dict = getDictionary('ja');
  
  // Japanese popular tags
  const popularTags = [
    'エレクトロニクス',
    '本',
    'ホーム・キッチン',
    'ファッション',
    'スポーツ',
    'おもちゃ・ゲーム',
    'ビューティー',
    'ヘルス',
    '自動車',
    'ペット用品',
    'オフィス用品',
    '食料品',
    'ベビー',
    'ツール・家庭改善',
    '映画・TV',
    'ミュージック',
    'ガーデン・アウトドア',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/ja" className="hover:underline">ホーム</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">タグ</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
        {dict.browseAllTags}
      </h1>
      
      <div className="prose max-w-none lg:prose-lg text-gray-700 mb-8">
        <p>
          {dict.tagsDescription}
        </p>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {popularTags.map((tag) => (
          <Link
            key={tag}
            href={`/ja/tags/${tag
              .toLowerCase()
              .replace(/・/g, "-")
              .replace(/ /g, "-")}`}
            className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center font-medium text-gray-700 hover:text-blue-600"
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* SEO Content */}
      <section className="mt-12 prose max-w-none lg:prose-lg text-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          タグで効率的に商品を見つける
        </h2>
        <p>
          私たちのタグシステムは、数千の商品を整理し、あなたが探しているものを迅速に見つけるのに役立ちます。
          各タグは関連する商品をグループ化し、より効率的なブラウジング体験を提供します。
        </p>
        <p>
          カテゴリ、ブランド、機能、価格帯などで商品を分類することで、
          理想的な商品を見つけるプロセスを簡素化します。
        </p>
      </section>
    </div>
  );
}
