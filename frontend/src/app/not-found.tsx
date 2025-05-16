import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | SEO Product Aggregator',
  // Next.js automatically adds <meta name="robots" content="noindex" /> for not-found pages
};

const NotFoundPage = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Page Not Found',
            description: 'The page you are looking for does not exist or has been moved.',
            url: typeof window !== 'undefined' ? window.location.href : '', // Attempt to get current URL
          }),
        }}
      />
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-md w-full">
          <svg
            className="w-32 h-32 mx-auto text-red-500 mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01"
            />
          </svg>

          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>

          {/* Placeholder for Search Bar - Implement with actual search functionality later */}
          {/* <div className="mb-8">
            <input
              type="search"
              placeholder="Search for products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div> */}

          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-150 w-full sm:w-auto"
            >
              Back to Homepage
            </Link>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2">Or try one of these popular links:</p>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                <Link href="/search" className="hover:underline">
                  Search Products
                </Link>
                <Link href="/tags/electronics" className="hover:underline">
                  Electronics
                </Link>
                <Link href="/tags/books" className="hover:underline">
                  Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
