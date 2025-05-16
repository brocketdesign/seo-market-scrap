import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-gray-300 transition-colors">
          SEO Product Aggregator
        </Link>
        <nav className="mt-4 md:mt-0">
          <ul className="flex space-x-4 md:space-x-6">
            <li>
              <Link href="/" className="hover:text-gray-300 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-gray-300 transition-colors">
                Search Products
              </Link>
            </li>
            <li>
              <Link href="/tags/electronics" className="hover:text-gray-300 transition-colors">
                Electronics
              </Link>
            </li>
            <li>
              <Link href="/tags/books" className="hover:text-gray-300 transition-colors">
                Books
              </Link>
            </li>
            {/* Example Admin Link - to be conditionally rendered later based on auth */}
            {/* <li>
              <Link href="/admin/dashboard" className="hover:text-gray-300 transition-colors">
                Admin
              </Link>
            </li> */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
