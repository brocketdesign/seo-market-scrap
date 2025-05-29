import Link from 'next/link';
import type { Metadata } from 'next';
import ProductDetail from '@/app/components/ProductDetail';

// Server-side function to fetch product data for metadata
async function getProductData(id: string) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiBaseUrl}/api/products/public/${id}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) return null;
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return null;
  }
}

// Helper function to generate dynamic metadata based on product slug
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  
  // Try to fetch real product data
  const productData = await getProductData(slug);
  
  // Use real data if available, or fallback to slug-based placeholder
  const productTitle = productData?.title || 
    slug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const productDescription = productData?.description || 
    `Detailed information, reviews, and pricing for ${productTitle}. Compare and find the best deals.`;
  
  const productImages = productData?.images?.length > 0 ? 
    [{ url: productData.images[0] }] : 
    undefined;
  
  const keywords = [
    productTitle,
    'product details',
    'reviews',
    'pricing',
    'comparison'
  ];
  
  if (productData?.tags) {
    keywords.push(...productData.tags);
  }
  
  if (productData?.category) {
    keywords.push(productData.category);
  }
  
  if (productData?.source) {
    keywords.push(productData.source);
  }

  // Add structured data for better SEO
  const structuredData = productData ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.title,
    "description": productData.description,
    "image": productData.images,
    "brand": {
      "@type": "Brand",
      "name": productData.source === 'rakuten' ? 'Rakuten' : productData.source === 'amazon' ? 'Amazon' : 'Unknown'
    },
    "aggregateRating": productData.ratings?.count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": productData.ratings.score,
      "reviewCount": productData.ratings.count
    } : undefined,
    "offers": productData.price ? {
      "@type": "Offer",
      "price": productData.price.replace(/[^0-9.]/g, ''),
      "priceCurrency": productData.price.includes('¥') || productData.price.includes('円') ? 'JPY' : 'USD',
      "availability": "https://schema.org/InStock"
    } : undefined
  } : null;

  return {
    title: `${productTitle} | Product Details | SEO Product Aggregator`,
    description: productDescription,
    keywords: keywords,
    openGraph: {
      title: `${productTitle} | Product Details`,
      description: productDescription,
      type: 'website',
      images: productImages,
    },
    other: structuredData ? {
      'structured-data': JSON.stringify(structuredData)
    } : undefined,
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail productId={slug} locale="en" />
    </div>
  );
}
