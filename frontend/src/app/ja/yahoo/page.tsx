'use client';

import TokenRedirect from '@/components/TokenRedirect';

// Example page that corresponds to pageId 86 (Yahoo affiliate)
export default function YahooProductPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Token Redirect Component - handles automatic redirection silently */}
      <TokenRedirect 
        pageId={86} // Yahoo affiliate ID
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Yahoo ショッピング特集
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-4">
              Yahoo ショッピングでお得な商品を見つけましょう！
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {/* Product cards would go here */}
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                <h3 className="font-semibold text-gray-900 mb-2">商品 1</h3>
                <p className="text-gray-600 text-sm mb-4">商品の説明が入ります。</p>
                <button className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
                  Yahoo で見る
                </button>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                <h3 className="font-semibold text-gray-900 mb-2">商品 2</h3>
                <p className="text-gray-600 text-sm mb-4">商品の説明が入ります。</p>
                <button className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
                  Yahoo で見る
                </button>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                <h3 className="font-semibold text-gray-900 mb-2">商品 3</h3>
                <p className="text-gray-600 text-sm mb-4">商品の説明が入ります。</p>
                <button className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
                  Yahoo で見る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
