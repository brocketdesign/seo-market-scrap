\
import Link from 'next/link';
import type { Metadata } from 'next';

// Helper function to generate dynamic metadata based on product slug
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  // In a real app, you would fetch product data here based on the slug
  // For now, we'll use a placeholder title
  const productTitle = slug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); // Capitalize slug

  return {
    title: `${productTitle} | Product Details | SEO Product Aggregator`,
    description: `Detailed information, reviews, and pricing for ${productTitle}. Compare and find the best deals from Amazon and Rakuten.`,
    keywords: [productTitle, 'product details', 'reviews', 'pricing', 'comparison', 'Amazon', 'Rakuten'],
    openGraph: {
      title: `${productTitle} | Product Details`,
      description: `Detailed information and reviews for ${productTitle}.`,
      type: 'product',
      // url: `https://www.yourwebsite.com/products/${slug}`,
      // images: [{ url: 'https://www.yourwebsite.com/product-image-${slug}.jpg' }], // Replace with actual product image
      // Add product specific OpenGraph tags like price, availability etc.
    },
    // Add Schema.org Product structured data here later
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  // In a real app, fetch product data based on slug
  const product = {
    name: slug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    price: 'Loading...',
    description: 'Loading product details...',
    images: ['/placeholder-image.svg', '/placeholder-image.svg', '/placeholder-image.svg'], // Placeholder images
    rating: 4.5,
    reviewsCount: 120,
    source: 'Amazon/Rakuten',
    features: ['Feature 1: Placeholder', 'Feature 2: Placeholder', 'Feature 3: Placeholder'],
    longDescription: `This is a placeholder for the detailed SEO-optimized description of ${slug.replace(/-/g, ' ')}. This section will be filled with keyword-rich content about the product's benefits, use cases, and unique selling propositions. It will help search engines understand the product better and rank it for relevant queries.`
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs - Placeholder */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/search" className="hover:underline">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images - Placeholder */}
        <div className="space-y-4">
          <div className="w-full h-96 bg-gray-200 rounded-lg shadow-md animate-pulse flex items-center justify-center">
            {/* Main image placeholder */}
            <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full h-24 bg-gray-200 rounded-md animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{product.name}</h1>
          
          {/* Price and Rating Placeholder */}
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-semibold text-blue-600 h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="flex items-center h-6 w-28 bg-gray-200 rounded-md animate-pulse"></div>
          </div>

          <div className="prose max-w-none text-gray-700">
            <h2 className="text-xl font-semibold">Product Description</h2>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-3/4"></div>
            </div>
          </div>

          {/* Add to Cart / View on Source - Placeholder */}
          <div className="h-12 w-48 bg-blue-600 rounded-md animate-pulse"></div>

          <div className="prose max-w-none text-gray-700">
            <h2 className="text-xl font-semibold">Features</h2>
            <ul className="list-disc list-inside space-y-1">
                {[1,2,3].map(i => <li key={i}><div className="h-4 bg-gray-200 rounded-md animate-pulse w-full"></div></li>)}
            </ul>
          </div>

          {/* Social Sharing Placeholder */}
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-2">Share this product:</h3>
            <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed SEO Description Section */}
      <section className="mt-12 py-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">In-Depth Overview: {product.name}</h2>
        <div className="prose max-w-none lg:prose-lg text-gray-700 space-y-3">
            <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-md animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </section>

      {/* Related Products Section - Placeholder */}
      <section className="mt-12 py-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-full h-32 bg-gray-200 rounded-md mb-3 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded-md mb-2 animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
