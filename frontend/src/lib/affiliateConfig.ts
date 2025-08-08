// Configuration for affiliate URL mappings
export const AFFILIATE_MAPPINGS = {
  86: {
    url: "//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3736574&pid=891642258",
    name: "Yahoo ショッピング",
    category: "ショッピング"
  },
  195: {
    url: "//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3736574&pid=891718679",
    name: "Expedia",
    category: "旅行"
  },
  203: {
    url: "//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3736574&pid=891642257",
    name: "ファッション",
    category: "ファッション"
  },
  301: {
    url: "https://rpx.a8.net/svt/ejp?a8mat=455G3P+70FU1M+2HOM+656YP&rakuten=y&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F0ea62065.34400275.0ea62066.204f04c0%2Fa25051679799_455G3P_70FU1M_2HOM_656YP%3Fpc%3Dhttp%253A%252F%252Fwww.rakuten.co.jp%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252F",
    name: "楽天市場",
    category: "ショッピング"
  }
} as const;

export type AffiliatePageId = keyof typeof AFFILIATE_MAPPINGS;

// WordPress API configuration
export const WORDPRESS_CONFIG = {
  API_URL: 'https://yuuyasumi.com/wp-json/myapi/v1',
  SHARED_SECRET: 'KnixnLd3'
} as const;

// Cookie configuration
export const COOKIE_CONFIG = {
  EXPIRY_HOURS: 1,
  SAME_SITE: 'Strict' as const,
  SECURE: true
} as const;
