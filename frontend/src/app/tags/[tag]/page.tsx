import Link from 'next/link';
import type { Metadata } from 'next';
import ClientTagResults from '@/app/components/ClientTagResults';

// Helper function to generate dynamic metadata based on tag
export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const tag = params.tag;
  const capitalizedTag = tag.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return {
    title: `${capitalizedTag} Products | SEO Product Aggregator`,
    description: `Browse all products tagged with "${capitalizedTag}". Find the best ${capitalizedTag} deals from Amazon and Rakuten.`,
    keywords: [capitalizedTag, 'products', 'tag', 'category', 'Amazon', 'Rakuten'],
    openGraph: {
      title: `${capitalizedTag} Products | SEO Product Aggregator`,
      description: `Discover a wide range of products under the ${capitalizedTag} tag.`,
      type: 'website',
      // url: `https://www.yourwebsite.com/tags/${tag}`,
      // images: [{ url: `https://www.yourwebsite.com/og-tag-${tag}-image.jpg` }],
    },
    // Add Schema.org CollectionPage structured data here later
  };
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const { tag } = params;
  const capitalizedTag = tag.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // In a real app, fetch products for this tag

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tags" className="hover:underline">Tags</Link> {/* Assuming a /tags overview page might exist */}
        <span className="mx-2">/</span>
        <span className="text-gray-700">{capitalizedTag}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Products Tagged: {capitalizedTag}
      </h1>
      
      {/* SEO-optimized introduction for the tag page */}
      <div className="prose max-w-none lg:prose-lg text-gray-700 mb-8">
        <p>
          Explore our curated collection of products under the "{capitalizedTag}" tag. Whether you're searching for the latest gadgets, essential home goods, or unique gifts, find top-rated items from Amazon and Rakuten right here. We provide detailed information to help you make the best choice for your {capitalizedTag.toLowerCase()} needs.
        </p>
      </div>
      
      <ClientTagResults tag={tag} />
    </div>
  );
}
