import Link from 'next/link';
import type { Metadata } from 'next';
import SearchResults from '../../components/SearchResults';
import { getDictionary } from '@/lib/i18n';

// Helper function to generate dynamic metadata based on search query
export async function generateMetadata({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const dict = getDictionary('ja');
  const query = searchParams?.q || '';
  const pageTitle = query ? `"${query}"の検索結果 | SEO Product Aggregator` : '商品検索 | SEO Product Aggregator';
  const description = query ? `"${query}"に一致する商品を見つけます。AmazonやRakutenからの豊富なカタログをお探しください。` : '探しているものを正確に見つけます。高度なフィルタリングオプションでAmazonやRakutenからの豊富な商品カタログを検索してください。';

  return {
    title: pageTitle,
    description: description,
    keywords: ['商品検索', '商品ファインダー', 'オンラインカタログ', 'フィルター商品', 'ソート商品', String(query)].filter(Boolean),
    openGraph: {
      title: pageTitle,
      description: description,
      type: 'website',
    },
  };
}

export default async function JapaneseSearchPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const dict = getDictionary('ja');
  const searchTerm = searchParams?.q ? String(searchParams.q) : '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        {searchTerm ? `"${searchTerm}"${dict.resultsFor}` : dict.searchTitle}
      </h1>
      <p className="text-gray-600 mb-8">
        {searchTerm ? `"${searchTerm}"${dict.showingResults}` : dict.searchSubtitle}
      </p>

      <SearchResults initialSearchTerm={searchTerm} locale="ja" />
    </div>
  );
}
