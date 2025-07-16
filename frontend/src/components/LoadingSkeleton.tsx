export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="h-12 bg-gray-200 rounded-md mb-4 max-w-4xl mx-auto animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-md mb-8 max-w-3xl mx-auto animate-pulse"></div>
          
          {/* Search Bar Skeleton */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Store Links Skeleton */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded-md mb-8 max-w-xs mx-auto animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {[...Array(22)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="w-8 h-8 bg-gray-200 rounded-md mb-2 mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keywords Section Skeleton */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded-md mb-8 max-w-xs mx-auto animate-pulse"></div>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section Skeleton */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded-md mb-8 max-w-xs mx-auto animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="w-full h-48 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
