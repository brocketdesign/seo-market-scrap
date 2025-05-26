import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Top Products | SEO Product Aggregator",
  description:
    "Your one-stop destination to find and compare top products from Amazon and Rakuten. We help you make informed buying decisions.",
  keywords: [
    "products",
    "best deals",
    "online shopping",
    "Amazon",
    "Rakuten",
    "product comparison",
  ],
  openGraph: {
    title: "Discover Top Products | SEO Product Aggregator",
    description:
      "Your one-stop destination to find and compare top products from Amazon and Rakuten.",
    type: "website",
    // Add your website URL and a representative image URL
    // url: 'https://www.yourwebsite.com',
    // images: [{ url: 'https://www.yourwebsite.com/og-image.jpg' }],
  },
};

export default async function HomePage() {
  // Async function to fetch the latest products
  async function getLatestProducts() {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBaseUrl}/api/products/public?sort=newest&limit=4`, { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      return data.products || [];
    } catch (err) {
      console.error('Error fetching latest products:', err);
      return [];
    }
  }

  // Use the getLatestProducts function to get products directly
  const products = await getLatestProducts();

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

      {/* Latest Products Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          Latest Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Display latest products */}
          {products.length === 0 ? (
            // Fallback to placeholders if no products are available
            Array(4).fill(0).map((_, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="w-full h-48 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-md mb-2 animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/2"></div>
              </div>
            ))
          ) : (
            // Map through the products array
            products.map((product: any) => (
              <Link 
                href={`/products/${product._id}`} 
                key={product._id} 
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow"
              >
                {product.images && product.images.length > 0 ? (
                  <div className="w-full h-48 relative mb-4">
                    <img 
                      src={product.images[0]} 
                      alt={product.title}
                      className="object-contain w-full h-full" 
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                
                <h3 className="font-medium text-lg mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-blue-600 font-semibold">{product.price}</p>
                
                {product.source && (
                  <div className="mt-2 text-sm text-gray-500">
                    Source: {product.source}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/search?sort=newest"
            className="text-blue-600 hover:underline font-medium"
          >
            View All Latest Products
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
