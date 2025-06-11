// Type definitions for the frontend application

export interface SettingsFormState {
  scrapingInterval: string;
  amazonApiKey: string;
  rakutenApiKey: string;
  emailNotifications: boolean;
  notificationEmail: string;
  userAgent: string;
  proxyEnabled: boolean;
  proxyUrl: string;
  maxConcurrentJobs: number;
}

export interface Product {
  _id: string;
  title: string;
  price: string;
  description: string;
  images: string[];
  source: string;
  sourceUrl: string;
  category?: string;
  tags?: string[];
  ratings?: { value: number; count: number };
  reviews?: { user: string; text: string; rating: number; date: string }[];
  scrapedAt: string;
  lastUpdatedAt?: string;
  contentLanguage: string;
}

export interface SearchParams {
  q?: string;
  page?: string;
  limit?: string;
  sort?: string;
  category?: string;
  source?: string;
  minPrice?: string;
  maxPrice?: string;
  language?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface SearchResponse {
  products: Product[];
  pagination: PaginationInfo;
  filters: {
    categories: string[];
    sources: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}
