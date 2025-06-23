'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { type Locale, getDictionary } from '@/lib/i18n';

interface Product {
  _id: string;
  title: string;
  price: string;
  description: string;
  images: string[];
  source: string;
  category?: string;
  tags?: string[];
  ratings?: { value: number; count: number };
  contentLanguage: string;
}

interface SearchProps {
  initialSearchTerm: string;
  initialTag?: string;
  locale?: Locale;
}

export default function SearchResults({ initialSearchTerm, initialTag, locale = 'en' }: SearchProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [tag, setTag] = useState(initialTag || '');
  const [source, setSource] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const dict = getDictionary(locale);
  const basePath = locale === 'ja' ? '/ja' : '';
  const contentLanguage = locale === 'ja' ? 'japanese' : 'english';

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, tag, source, sortBy, currentPage, contentLanguage]);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = new URL(`${apiBaseUrl}/api/products/public`);
      
      // Add query parameters
      if (searchTerm) url.searchParams.append('search', searchTerm);
      if (tag) url.searchParams.append('tag', tag);
      if (source !== 'all') url.searchParams.append('source', source);
      url.searchParams.append('sort', sortBy);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', '12');
      url.searchParams.append('contentLanguage', contentLanguage);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message || dict.error);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q') as string;
    setSearchTerm(query);
    setCurrentPage(1); // Reset to first page on new search
    
    // Update the URL without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.pushState({}, '', url.toString());
  }

  function handleSourceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSource(e.target.value);
    setCurrentPage(1);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSortBy(e.target.value);
    setCurrentPage(1);
  }

  const formatRating = (rating: number) => {
    return (
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${
              star <= Math.floor(rating) ? 'fill-current' : 'stroke-current fill-none'
            }`}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-6">
        <label htmlFor="search-input" className="sr-only">{dict.search}</label>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            id="search-input"
            type="search"
            name="q"
            defaultValue={searchTerm}
            placeholder={locale === 'ja' ? '商品を検索...' : 'Search products...'}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            {locale === 'ja' ? '検索' : 'Search'}
          </button>
        </div>
      </form>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <p className="text-sm text-gray-500 mb-4 md:mb-0">
          {loading ? dict.loading : 
            products.length === 0 ? dict.noProductsFound : 
            `${locale === 'ja' ? '表示中' : 'Showing'} ${products.length} ${locale === 'ja' ? '商品' : `product${products.length !== 1 ? 's' : ''}`}`}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center">
            <label htmlFor="source-filter" className="text-sm font-medium text-gray-700 mr-2">
              {locale === 'ja' ? 'ソース:' : 'Source:'}
            </label>
            <select
              id="source-filter"
              value={source}
              onChange={handleSourceChange}
              className="border border-gray-300 rounded-md text-sm py-1 px-2"
            >
              <option value="all">{locale === 'ja' ? 'すべてのソース' : 'All Sources'}</option>
              <option value="amazon">Amazon</option>
              <option value="rakuten">Rakuten</option>
            </select>
          </div>

          <div className="flex items-center">
            <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 mr-2">
              {locale === 'ja' ? 'ソート:' : 'Sort by:'}
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={handleSortChange}
              className="border border-gray-300 rounded-md text-sm py-1 px-2"
            >
              <option value="newest">{locale === 'ja' ? '最新順' : 'Newest First'}</option>
              <option value="price_asc">{locale === 'ja' ? '価格: 安い順' : 'Price: Low to High'}</option>
              <option value="price_desc">{locale === 'ja' ? '価格: 高い順' : 'Price: High to Low'}</option>
              <option value="rating">{locale === 'ja' ? '評価順' : 'Highest Rated'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-md mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-md mb-2 w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                href={`${basePath}/products/${product._id}`}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
              >
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.source === 'amazon'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.source}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                  {product.title}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-700">{product.price}</span>
                  {product.ratings && product.ratings.value > 0 && (
                    <div className="flex items-center">
                      {formatRating(product.ratings.value)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  {locale === 'ja' ? '前' : 'Previous'}
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === i + 1
                        ? 'bg-indigo-50 text-indigo-600 z-10'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  {locale === 'ja' ? '次' : 'Next'}
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-10 rounded-lg shadow-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mb-2">{dict.noProductsFound}</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? (locale === 'ja' 
                  ? `「${searchTerm}」に一致する商品が見つかりませんでした。別の検索条件をお試しください。`
                  : `We couldn't find any products matching "${searchTerm}". Please try a different search term or filter.`)
              : (locale === 'ja' 
                  ? '異なる検索条件を試すか、カテゴリを参照してください。'
                  : 'Try different search terms or browse categories.')}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSource('all');
              setSortBy('newest');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {locale === 'ja' ? 'フィルターをクリア' : 'Clear Filters'}
          </button>
        </div>
      )}
    </div>
  );
}
