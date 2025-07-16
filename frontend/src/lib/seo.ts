import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
}

export function generateSEOMetadata({
  title = "Rakurabu.com（ラクラブ）- 楽して比べる価格比較サイト",
  description = "Rakurabu.com（ラクラブ）は「楽して比べる」をコンセプトにしたショッピング比較サイト。Amazon、楽天市場、Yahoo!ショッピングの商品を一括検索し、最安値を比較できます。",
  keywords = "Rakurabu,ラクラブ,価格比較,最安値,Amazon,楽天市場,Yahoo!ショッピング,商品検索,オンラインショッピング,通販,楽して比べる",
  canonicalUrl = "https://rakurabu.com/ja",
  ogImage = "/og-image-ja.jpg",
}: SEOProps = {}): Metadata {
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [ogImage],
      locale: "ja_JP",
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ja': '/ja',
        'en': '/',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "価格比較.jp",
    "alternateName": "価格比較サイト",
    "url": "https://yourdomain.com/ja",
    "description": "Amazon、楽天市場、Yahoo!ショッピングの商品を一括検索し、最安値を比較できるサイト",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://yourdomain.com/ja/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/youraccount",
      "https://facebook.com/yourpage"
    ]
  };
}

export function ProductStructuredData({ product }: { product: any }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description || product.title,
    "image": product.images,
    "offers": {
      "@type": "Offer",
      "price": product.price?.replace(/[^\d.]/g, ''),
      "priceCurrency": "JPY",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": product.source === 'amazon' ? 'Amazon' : product.source === 'rakuten' ? '楽天市場' : 'Yahoo!ショッピング'
      }
    },
    "aggregateRating": product.ratings ? {
      "@type": "AggregateRating",
      "ratingValue": product.ratings.value,
      "reviewCount": product.ratings.count
    } : undefined
  };
}
