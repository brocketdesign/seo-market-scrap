import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse All Tags | SEO Product Aggregator',
  description: 'Explore our product catalog by tags and categories. Find products organized by type, use case, brand, and more.',
  keywords: ['product tags', 'browse categories', 'product categories', 'product types', 'shopping categories'],
  openGraph: {
    title: 'Browse All Tags | SEO Product Aggregator',
    description: 'Explore our product catalog by tags and categories.',
    type: 'website',
  },
};

export default function TagsPage() {
  // In a real app, fetch all available tags/categories
  const popularTags = [
    'Electronics',
    'Books',
    'Home & Kitchen',
    'Fashion',
    'Sports',
    'Toys & Games',
    'Beauty',
    'Health',
    'Automotive',
    'Pet Supplies',
    'Office Products',
    'Grocery',
    'Baby',
    'Tools & Home Improvement',
    'Movies & TV',
    'Music',
    'Garden & Outdoor',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Tags</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
        Browse All Product Tags
      </h1>
      
      <div className="prose max-w-none lg:prose-lg text-gray-700 mb-8">
        <p>
          Looking for something specific? Browse our extensive collection of products by tag or category. 
          Our tags help you quickly find exactly what you're looking for, from electronics to home goods, books, and more.
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {popularTags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
            className="block bg-white p-4 rounded-lg shadow hover:shadow-xl transition-shadow text-center"
          >
            <span className="font-medium text-gray-800">{tag}</span>
            <div className="mt-2 text-sm text-gray-500">View Products</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
