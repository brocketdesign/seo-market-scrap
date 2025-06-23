import Link from 'next/link';
import type { Metadata } from 'next';
import ProductDetail from '../../../components/ProductDetail';

// Server-side function to fetch product data for metadata
async function getProductData(id: string) {
  try {
    const apiBaseUrl = `localhost:${process.env.PORT}` || process.env.API_URL || 'http://localhost:8000';
    console.log('apiBaseUrl:', apiBaseUrl, 'process.env.PORT:', process.env.PORT);
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
    `${productTitle}の詳細情報、レビュー、価格。最高のお得な情報を比較して見つけてください。`;
  
  const productImages = productData?.images?.length > 0 ? 
    [{ url: productData.images[0] }] : 
    undefined;
  
  const keywords = [
    productTitle,
    '商品詳細',
    'レビュー',
    '価格',
    '比較',
    '日本語'
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

  // Add structured data for better SEO (Japanese)
  const structuredData = productData ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productData.title,
    "description": productData.description,
    "image": productData.images,
    "brand": {
      "@type": "Brand",
      "name": productData.source === 'rakuten' ? '楽天' : productData.source === 'amazon' ? 'Amazon' : 'Unknown'
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
    title: `${productTitle} | SEO Product Aggregator`,
    description: productDescription,
    keywords: keywords,
    openGraph: {
      title: `${productTitle} | SEO Product Aggregator`,
      description: productDescription,
      type: 'website',
      images: productImages,
      locale: 'ja_JP',
    },
    other: structuredData ? {
      'structured-data': JSON.stringify(structuredData)
    } : undefined,
  };
}

export default function JapaneseProductPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/ja" className="hover:underline">ホーム</Link>
        <span className="mx-2">/</span>
        <Link href="/ja/search" className="hover:underline">商品</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">商品詳細</span>
      </nav>

      <ProductDetail productId={slug} locale="ja" />
    </div>
  );
}
