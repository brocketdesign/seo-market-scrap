import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h5 className="text-lg font-semibold mb-2">Quick Links</h5>
            <ul className="space-y-1">
              <li><Link href="/" className="hover:text-gray-300 transition-colors">Home</Link></li>
              <li><Link href="/search" className="hover:text-gray-300 transition-colors">Search</Link></li>
              <li><Link href="/tags" className="hover:text-gray-300 transition-colors">Browse Tags</Link></li>
              {/* Add more links as needed */}
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-2">Information</h5>
            <ul className="space-y-1">
              <li><Link href="/about" className="hover:text-gray-300 transition-colors">About Us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-gray-300 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-2">Contact</h5>
            <p>Email: support@seoproductaggregator.com</p>
            {/* Add social media links if any */}
          </div>
        </div>
        <p className="text-sm text-gray-400">
          &copy; {currentYear} SEO Product Aggregator. All rights reserved.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Disclaimer: This site aggregates product information from various sources. We do not sell products directly.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
