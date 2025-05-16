import Link from 'next/link';
import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Search Products | SEO Product Aggregator',
//   description: 'Find exactly what you are looking for. Search our extensive catalog of products from Amazon and Rakuten with advanced filtering options.',
//   keywords: ['search products', 'product finder', 'online catalog', 'filter products', 'sort products'],
// };

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
      // url: `https://www.yourwebsite.com/search${query ? '?q=' + query : ''}`,
      // images: [{ url: 'https://www.yourwebsite.com/og-search-image.jpg' }],
    },
  };
}

export default function SearchPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const searchTerm = searchParams?.q || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
        {searchTerm ? `Results for "${searchTerm}"` : 'Search Our Products'}
      </h1>
      <p className="text-gray-600 mb-8">
        {searchTerm ? `Showing products related to your search for "${searchTerm}".` : 'Use the filters to narrow down your search and find the perfect item.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar - Placeholder */}
        <aside className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Filters</h2>
          {/* Search Input within Filters */}
          <form action="/search" method="GET" className="mb-6">
            <label htmlFor="search-input" className="sr-only">Search</label>
            <input
              id="search-input"
              type="search"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search within results..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
             <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Search</button>
          </form>

          {/* Price Range Placeholder */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Price Range</h3>
            <div className="h-8 bg-gray-200 rounded-md animate-pulse"></div>
          </div>

          {/* Category Filter Placeholder */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Category</h3>
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-6 bg-gray-200 rounded-md animate-pulse"></div>)}
            </div>
          </div>

          {/* Rating Filter Placeholder */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Rating</h3>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-6 bg-gray-200 rounded-md animate-pulse"></div>)}
            </div>
          </div>
        </aside>

        {/* Search Results - Placeholder */}
        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">Showing 1-12 of 200 results (placeholder)</p>
            {/* Sort Options Placeholder */}
            <div className="w-48 h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow">
                <div className="w-full h-40 bg-gray-200 rounded-md mb-4 animate-pulse"></div> {/* Image Placeholder */}
                <div className="h-5 bg-gray-200 rounded-md mb-2 animate-pulse w-3/4"></div> {/* Title Placeholder */}
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/2 mb-2"></div> {/* Price Placeholder */}
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/4"></div> {/* Rating Placeholder */}
              </div>
            ))}
          </div>

          {/* Pagination Placeholder */}
          <nav className="mt-10 flex justify-center">
            <ul className="flex space-x-2">
              <li><span className="px-4 py-2 border rounded-md bg-gray-200 text-gray-500 animate-pulse">Previous</span></li>
              {[1,2,3].map(i => <li key={i}><span className="px-4 py-2 border rounded-md bg-gray-200 text-gray-500 animate-pulse w-10 h-10 block"></span></li>)}
              <li><span className="px-4 py-2 border rounded-md bg-gray-200 text-gray-500 animate-pulse">Next</span></li>
            </ul>
          </nav>
        </main>
      </div>
    </div>
  );
}
