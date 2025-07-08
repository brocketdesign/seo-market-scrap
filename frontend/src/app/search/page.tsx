import Link from 'next/link';
import type { Metadata } from 'next';
import SearchResults from '../../components/SearchResults';

// Helper function to generate dynamic metadata based on search query
export async function generateMetadata({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const query = searchParams?.q || '';
  const pageTitle = query ? `Search results for "${query}" | SEO Product Aggregator` : 'Search Products | SEO Product Aggregator';
  const description = query ? `Find products matching "${query}". Explore our extensive catalog from Amazon and Rakuten.` : 'Find exactly what you are looking for. Search our extensive catalog of products from Amazon and Rakuten with advanced filtering options.';

  return {
    title: pageTitle,
    description: description,
    keywords: ['search products', 'product finder', 'online catalog', 'filter products', 'sort products', String(query)].filter(Boolean),
    openGraph: {
      title: pageTitle,
      description: description,
      type: 'website',
    },
  };
}

export default function SearchPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const searchTerm = searchParams?.q ? String(searchParams.q) : '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        {searchTerm ? `Results for "${searchTerm}"` : 'Search Our Products'}
      </h1>
      <p className="text-gray-600 mb-8">
        {searchTerm ? `Showing products related to your search for "${searchTerm}".` : 'Use the filters to narrow down your search and find the perfect item.'}
      </p>

      <SearchResults initialSearchTerm={searchTerm} locale="en" />
    </div>
  );
}
