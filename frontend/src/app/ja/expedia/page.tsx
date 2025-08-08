'use client';

import { useState } from 'react';
import { useTokenRedirect } from '@/hooks/useTokenRedirect';

// Example page using the hook instead of the component
export default function ExpediaProductPage() {
  const [redirectStatus, setRedirectStatus] = useState<string | null>(null);

  const handleRedirectStart = () => {
    setRedirectStatus('Expedia にリダイレクト中...');
  };

  const handleRedirectError = (error: string) => {
    setRedirectStatus(`エラー: ${error}`);
  };

  // Use the hook for token redirection
  useTokenRedirect({
    pageId: 195, // Expedia affiliate ID
    onRedirectStart: handleRedirectStart,
    onRedirectError: handleRedirectError,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Expedia 旅行特集
          </h1>

          {redirectStatus && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800">{redirectStatus}</p>
            </div>
          )}

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-4">
              Expedia で素敵な旅行プランを見つけましょう！
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">国内旅行</h3>
                <p className="mb-4">日本全国の素敵な旅行先をご紹介</p>
                <button className="bg-white text-blue-600 py-2 px-4 rounded-md hover:bg-gray-100 transition-colors">
                  詳細を見る
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">海外旅行</h3>
                <p className="mb-4">世界各地の魅力的な観光地</p>
                <button className="bg-white text-green-600 py-2 px-4 rounded-md hover:bg-gray-100 transition-colors">
                  詳細を見る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
