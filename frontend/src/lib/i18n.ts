export const locales = ['en', 'ja'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export const dictionaries = {
  en: {
    // Navigation
    home: 'Home',
    search: 'Search Products',
    electronics: 'Electronics',
    books: 'Books',
    
    // Homepage
    heroTitle: 'Find Your Next Favorite Product',
    heroSubtitle: 'We aggregate the best products from leading online marketplaces, making it easy for you to discover, compare, and choose.',
    startSearching: 'Start Searching Now',
    featuredProducts: 'Featured Products',
    viewAllFeatured: 'View All Featured Products',
    popularCategories: 'Popular Categories',
    whyChooseUs: 'Why Choose Us?',
    whyChooseUsText: 'Navigating the vast online marketplaces of Amazon and Rakuten can be overwhelming. Our platform simplifies your shopping experience by curating top-rated products, providing detailed comparisons, and highlighting the best deals.',
    
    // Search
    searchTitle: 'Search Our Products',
    searchSubtitle: 'Use the filters to narrow down your search and find the perfect item.',
    resultsFor: 'Results for',
    showingResults: 'Showing products related to your search for',
    
    // Tags
    browseAllTags: 'Browse All Product Tags',
    tagsDescription: 'Discover products organized by categories, brands, features, and more. Browse through our comprehensive tag system to find exactly what you need.',
    
    // Product
    viewOriginal: 'View Original',
    price: 'Price',
    category: 'Category',
    source: 'Source',
    tags: 'Tags',
    description: 'Description',
    productDescription: 'Product Description',
    productTags: 'Product Tags',
    customerReviews: 'Customer Reviews',
    addedOn: 'Added',
    lastUpdated: 'Last updated',
    language: 'Language',
    reviews: 'reviews',
    productNotFound: 'Product not found',
    products: 'Products',
    
    // Language switcher
    switchToJapanese: 'Switch to Japanese',
    switchToEnglish: 'Switch to English',
    
    // Loading and errors
    loading: 'Loading...',
    error: 'An error occurred',
    noProductsFound: 'No products found',
  },
  ja: {
    // Navigation
    home: 'ホーム',
    search: '商品検索',
    electronics: '電子機器',
    books: '本',
    
    // Homepage
    heroTitle: '次のお気に入り商品を見つけよう',
    heroSubtitle: '主要なオンラインマーケットプレイスから最高の商品を集約し、発見、比較、選択を簡単にします。',
    startSearching: '今すぐ検索を開始',
    featuredProducts: 'おすすめ商品',
    viewAllFeatured: 'すべてのおすすめ商品を見る',
    popularCategories: '人気カテゴリー',
    whyChooseUs: '私たちを選ぶ理由',
    whyChooseUsText: 'AmazonやRakutenの膨大なオンラインマーケットプレイスをナビゲートするのは圧倒的かもしれません。私たちのプラットフォームは、トップ評価の商品をキュレーションし、詳細な比較を提供し、最高のお得な情報をハイライトすることで、あなたのショッピング体験を簡素化します。',
    
    // Search
    searchTitle: '商品を検索',
    searchSubtitle: 'フィルターを使用して検索を絞り込み、完璧なアイテムを見つけてください。',
    resultsFor: '検索結果',
    showingResults: '検索クエリに関連する商品を表示中',
    
    // Tags
    browseAllTags: 'すべての商品タグを閲覧',
    tagsDescription: 'カテゴリ、ブランド、機能などで整理された商品を発見してください。包括的なタグシステムを通じて、まさに必要なものを見つけてください。',
    
    // Product
    viewOriginal: '元のページを見る',
    price: '価格',
    category: 'カテゴリ',
    source: 'ソース',
    tags: 'タグ',
    description: '説明',
    productDescription: '商品説明',
    productTags: '商品タグ',
    customerReviews: 'カスタマーレビュー',
    addedOn: '追加日',
    lastUpdated: '最終更新',
    language: '言語',
    reviews: 'レビュー',
    productNotFound: '商品が見つかりません',
    products: '商品',
    
    // Language switcher
    switchToJapanese: '日本語に切り替え',
    switchToEnglish: 'English に切り替え',
    
    // Loading and errors
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    noProductsFound: '商品が見つかりません',
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function getOppositeLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ja' : 'en';
}

// Helper function to extract locale from pathname
export function getLocaleFromPathname(pathname: string): { locale: Locale; pathWithoutLocale: string } {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments[0] === 'ja') {
    return {
      locale: 'ja',
      pathWithoutLocale: '/' + segments.slice(1).join('/'),
    };
  }
  
  return {
    locale: 'en',
    pathWithoutLocale: pathname,
  };
}
