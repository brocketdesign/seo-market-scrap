import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "@/app/globals.css";
import { generateSEOMetadata } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });
const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-jp'
});

export const metadata: Metadata = generateSEOMetadata();

export default function JapaneseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${notoSansJP.variable} bg-gray-50`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Rakurabu.com（ラクラブ）",
            "alternateName": "楽して比べる価格比較サイト",
            "url": "https://rakurabu.com/ja",
            "description": "Rakurabu.com（ラクラブ）は「楽して比べる」をコンセプトにしたショッピング比較サイト。Amazon、楽天市場、Yahoo!ショッピングの商品を一括検索し、最安値を比較できます。",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://rakurabu.com/ja/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      {children}
    </div>
  );
}
