import Link from 'next/link';
import type { Metadata } from 'next';
import SearchResults from '../../../components/SearchResults';
import { getDictionary } from '@/lib/i18n';

// Helper function to generate dynamic metadata based on tag
export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const dict = getDictionary('ja');
  const tag = decodeURIComponent(params.tag);
  const displayTag = tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const pageTitle = `${displayTag}の商品 | SEO Product Aggregator`;
  const description = `${displayTag}カテゴリの商品を閲覧してください。AmazonやRakutenからの最高の${displayTag}商品を見つけてください。`;

  return {
    title: pageTitle,
    description: description,
    keywords: [displayTag, '商品', 'オンラインショッピング', 'Amazon', 'Rakuten'],
    openGraph: {
      title: pageTitle,
      description: description,
      type: 'website',
    },
  };
}

export default function JapaneseTagPage({ params }: { params: { tag: string } }) {
  const dict = getDictionary('ja');
  const tag = decodeURIComponent(params.tag);
  const displayTag = tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/ja" className="hover:underline">ホーム</Link>
        <span className="mx-2">/</span>
        <Link href="/ja/tags" className="hover:underline">タグ</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{displayTag}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        {displayTag}の商品
      </h1>
      <p className="text-gray-600 mb-8">
        {displayTag}カテゴリのすべての商品を閲覧してください。フィルターとソートオプションを使用して、完璧な商品を見つけてください。
      </p>

      <SearchResults 
        initialSearchTerm="" 
        initialTag={tag}
        locale="ja"
      />
    </div>
  );
}
