'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Product {
  _id: string;
  title: string;
  price: string;
  images: string[];
  source: string;
  category?: string;
  ratings?: { value: number; count: number };
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBaseUrl}/api/products/public?limit=4&sort=featured`);
        
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
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4 rounded-lg shadow-xl">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Next Favorite Product
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            We aggregate the best products from leading online marketplaces, making
            it easy for you to discover, compare, and choose.
          </p>
          <Link
            href="/search"
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-md hover:bg-gray-100 transition-colors text-lg"
          >
            Start Searching Now
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          Featured Products
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="w-full h-48 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-md mb-2 animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-md text-red-700">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link 
                key={product._id} 
                href={`/products/${product._id}`}
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.source === 'amazon' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.source}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-700">{product.price}</span>
                  {product.ratings && (
                    <div className="flex items-center">
                      <div className="text-amber-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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
            href="/search?sort=featured"
            className="text-blue-600 hover:underline font-medium"
          >
            View All Featured Products
          </Link>
        </div>
      </section>

      {/* Popular Categories/Tags Section - Placeholder */}
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {["Electronics", "Books", "Home & Kitchen", "Fashion", "Sports"].map(
            (category) => (
              <Link
                key={category}
                href={`/tags/${category
                  .toLowerCase()
                  .replace(/ & /g, "-")
                  .replace(/ /g, "-")}`}
                className="block bg-gray-100 p-4 rounded-lg shadow hover:bg-gray-200 transition-colors text-center font-medium text-gray-700"
              >
                {category}
              </Link>
            )
          )}
        </div>
      </section>

      {/* SEO Content Block */}
      <section className="prose max-w-none lg:prose-xl text-gray-700">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800">
          Why Choose Us?
        </h2>
        <p>
          Navigating the vast online marketplaces of Amazon and Rakuten can be
          overwhelming. Our platform simplifies your shopping experience by
          curating top-rated products, providing detailed comparisons, and
          highlighting the best deals. Whether you're looking for the latest
          electronics, must-read books, or essential home goods, we've got you
          covered.
        </p>
        <p>
          Our commitment to SEO best practices ensures that you find relevant
          product information quickly and efficiently. We focus on delivering a
          fast, user-friendly interface that enhances your journey from discovery
          to decision.
        </p>
      </section>
    </div>
  );
}
