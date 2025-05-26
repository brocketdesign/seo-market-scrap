'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ImageSlider from './ImageSlider';

interface ProductDetail {
  _id: string;
  title: string;
  price: string;
  description: string;
  images: string[];
  source: string;
  sourceUrl: string;
  category?: string;
  tags?: string[];
  ratings?: { value: number; count: number };
  reviews?: { user: string; text: string; rating: number; date: string }[];
  scrapedAt: string;
  lastUpdatedAt?: string;
  language?: string;
}

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBaseUrl}/api/products/public/${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching product details');
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images - Loading placeholder */}
          <div className="space-y-4">
            <div className="w-full h-96 bg-gray-200 rounded-lg shadow-md"></div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-full h-24 bg-gray-200 rounded-md"></div>
              ))}
            </div>
          </div>

          {/* Product Details - Loading placeholder */}
          <div className="space-y-6">
            <div className="h-10 bg-gray-200 rounded-md w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded-md w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-md w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium leading-4 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Product not found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Sorry, we couldn't find the product you're looking for.</p>
            </div>
            <div className="mt-4">
              <Link 
                href="/search"
                className="inline-flex items-center rounded-md border border-transparent bg-yellow-100 px-3 py-2 text-sm font-medium leading-4 text-yellow-700 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Search for products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/search" className="hover:underline">Products</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/tags/${product.category.toLowerCase()}`} className="hover:underline">{product.category}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div>
          <ImageSlider images={product.images || []} productName={product.title} />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{product.title}</h1>
          
          {/* Price and Source */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <div className="text-3xl font-semibold text-indigo-600 mb-2 sm:mb-0">{product.price}</div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                product.source === 'amazon' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
              }`}>
                {product.source}
              </span>
            </div>
          </div>

          {/* Rating if available */}
          {product.ratings && product.ratings.value > 0 && (
            <div className="flex items-center">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${
                      star <= Math.floor(product.ratings.value) ? 'fill-current' : 'stroke-current fill-none'
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
                <span className="ml-1 text-sm text-gray-700">
                  {product.ratings.value.toFixed(1)} ({product.ratings.count} reviews)
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="prose max-w-none text-gray-700">
            <h2 className="text-xl font-semibold">Product Description</h2>
            <div className="whitespace-pre-line">{product.description}</div>
          </div>

          {/* Tags Section */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Product Tags</h2>
              <div className="flex flex-wrap gap-2 border p-3 rounded-lg bg-gray-50">
                {product.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* View on Source */}
          <div>
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View on {product.source}
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Product metadata */}
          <div className="text-xs text-gray-500">
            <p>Added: {formatDate(product.scrapedAt)}</p>
            {product.lastUpdatedAt && <p>Last updated: {formatDate(product.lastUpdatedAt)}</p>}
            {product.language && <p>Language: {product.language.toUpperCase()}</p>}
          </div>
        </div>
      </div>

      {/* Reviews Section - If available */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {product.reviews.map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-amber-400 flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 ${
                            star <= review.rating ? 'fill-current' : 'stroke-current fill-none'
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
                    <span className="ml-2 font-medium">{review.user}</span>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                </div>
                <p className="text-gray-700">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
