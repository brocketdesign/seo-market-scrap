'use client';

import { useSession } from 'next-auth/react';
import { useState, FormEvent, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ScrapedProduct {
  title: string;
  price: string;
  description: string;
  images: string[];
  ratings: { score: number; count: number };
  reviews: { author: string; text: string }[];
  source: string;
  sourceUrl: string;
  category?: string;
  tags?: string[];
}

export default function ScraperPage() {
  const { data: session } = useSession();
  const [scrapeKeyword, setScrapeKeyword] = useState('');
  const [scrapeSource, setScrapeSource] = useState('amazon');
  const [scrapedProducts, setScrapedProducts] = useState<ScrapedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  
  // Handle form submission for scraping
  const handleScrapeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setScrapedProducts([]);
    setSaveMessage(null);

    if (!session || !session.accessToken) {
      setError('Authentication error or missing token. Please sign in again.');
      setIsLoading(false);
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/scrape/manual`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ keywordOrUrl: scrapeKeyword, source: scrapeSource }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to scrape: ${response.statusText}`);
      }

      const data: ScrapedProduct[] = await response.json();
      setScrapedProducts(data);
      if (data.length === 0) {
        setError('No products found for the given criteria.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during scraping.');
    }
    setIsLoading(false);
  };

  // Handle saving a product
  const handleSaveProduct = async (product: ScrapedProduct) => {
    const productId = `${product.source}-${encodeURIComponent(product.sourceUrl)}`;
    
    // Set this specific product to saving state
    setSavingStates(prev => ({
      ...prev,
      [productId]: true
    }));
    
    setSaveMessage(null);
    setError(null);

    if (!session || !session.accessToken) {
      setError('Authentication error or missing token. Please sign in again.');
      setSavingStates(prev => ({
        ...prev,
        [productId]: false
      }));
      return;
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/scrape/save`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to save product: ${response.statusText}`);
      }
      
      const savedProduct = await response.json();
      setSaveMessage(`Product "${savedProduct.title}" saved successfully! ID: ${savedProduct._id}`);
      
      // Remove the saved product from the list
      setScrapedProducts(prev => prev.filter(p => 
        p.sourceUrl !== product.sourceUrl || p.source !== product.source
      ));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving the product.');
    }
    
    // Reset saving state for this product
    setSavingStates(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  // Format rating display
  const formatRating = (score: number, count: number) => {
    return (
      <div className="flex items-center text-sm">
        <div className="flex text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg 
              key={i}
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 ${i < Math.floor(score) ? 'fill-current' : 'stroke-current fill-none'}`} 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ))}
        </div>
        <span className="ml-2 text-gray-600">({count})</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Scraper</h1>
        <Link 
          href="/admin/dashboard" 
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      {/* Scraping Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Scrape Products
        </h2>
        
        <form onSubmit={handleScrapeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scrapeKeyword" className="block text-sm font-medium text-gray-700 mb-1">
                Keyword or URL
              </label>
              <input 
                type="text" 
                id="scrapeKeyword" 
                value={scrapeKeyword}
                onChange={(e) => setScrapeKeyword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Product name or direct product URL"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a keyword to search or paste a full product URL
              </p>
            </div>
            
            <div>
              <label htmlFor="scrapeSource" className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <select 
                    id="scrapeSource" 
                    value={scrapeSource}
                    onChange={(e) => setScrapeSource(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="amazon">Amazon</option>
                    <option value="rakuten">Rakuten</option>
                    <option value="all">Both Sources</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scraping...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Scrape
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Messages (Error/Success) */}
      {error && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}
      
      {saveMessage && (
        <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-lg flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span><strong>Success:</strong> {saveMessage}</span>
        </div>
      )}

      {/* Scraped Results */}
      {scrapedProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Scraped Products ({scrapedProducts.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {scrapedProducts.map((product, index) => {
              const productId = `${product.source}-${encodeURIComponent(product.sourceUrl)}`;
              const isSaving = savingStates[productId] || false;
              
              return (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex flex-col md:flex-row">
                    {/* Product Image */}
                    <div className="w-full md:w-48 flex-shrink-0 mb-4 md:mb-0">
                      {product.images && product.images.length > 0 ? (
                        <div className="relative h-48 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={product.images[0]} 
                            alt={product.title} 
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-product.png';
                            }}
                          />
                          <div className="absolute bottom-0 right-0 p-1 bg-gray-800 bg-opacity-75 rounded-tl-md">
                            <span className="text-xs text-white">
                              {product.images.length} {product.images.length === 1 ? 'image' : 'images'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 md:ml-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{product.title}</h3>
                          <div className="mt-1 flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.source === 'amazon' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                              {product.source}
                            </span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-gray-500 text-sm">{product.category || 'Uncategorized'}</span>
                          </div>
                        </div>
                        <span className="text-lg font-medium text-gray-900">{product.price}</span>
                      </div>
                      
                      {/* Ratings */}
                      {product.ratings && product.ratings.score > 0 && (
                        <div className="mt-2">
                          {formatRating(product.ratings.score, product.ratings.count)}
                        </div>
                      )}
                      
                      {/* Description */}
                      {product.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                          {product.description}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {product.tags.slice(0, 5).map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                          {product.tags.length > 5 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              +{product.tags.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Source URL & Actions */}
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <a 
                          href={product.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Original
                        </a>
                        
                        <div className="mt-2 sm:mt-0">
                          <button 
                            onClick={() => handleSaveProduct(product)}
                            disabled={isSaving}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                          >
                            {isSaving ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Save to Database
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State when not yet searched */}
      {!isLoading && scrapedProducts.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Enter a keyword or URL above and start scraping products from Amazon or Rakuten.
          </p>
          <ul className="text-sm text-gray-600 space-y-2 max-w-md mx-auto text-left">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Search by product name (e.g., "smartphone", "wireless headphones")
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Enter a full product URL from Amazon or Rakuten
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Select which marketplace to scrape from (or both)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
