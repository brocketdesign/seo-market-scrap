import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEO Product Aggregator", // Default title, can be overridden per page
  description: "Find the best products from Amazon and Rakuten, optimized for your search.",
  // Add more default metadata here if needed (e.g., openGraph)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow container mx-auto p-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
