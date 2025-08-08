'use client';

import { useState } from 'react';
import TokenRedirect from '@/components/TokenRedirect';

export default function RakutenPage() {
  const [redirectStatus, setRedirectStatus] = useState<string | null>(null);

  const handleRedirectStart = () => {
    setRedirectStatus('楽天市場にリダイレクト中...');
  };

  const handleRedirectError = (error: string) => {
    setRedirectStatus(`エラー: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      {/* Token Redirect Component - handles automatic redirection */}
      <TokenRedirect 
        pageId={301} // Rakuten affiliate ID
        onRedirectStart={handleRedirectStart}
        onRedirectError={handleRedirectError}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            楽天市場へようこそ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            日本最大級のインターネットショッピングモール！豊富な商品ラインナップと楽天ポイントでお得にお買い物
          </p>
        </div>

        {/* Redirect Status */}
        {redirectStatus && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full mr-3"></div>
              <p className="text-red-800 font-medium">{redirectStatus}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-red-500 to-red-600 px-8 py-12 text-white">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">楽天市場特集</h2>
              <p className="text-red-100 text-lg mb-6">
                楽天ポイントがザクザク貯まる！使える！日本最大級のネットショッピング
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">楽天ポイント最大16倍</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">送料無料商品多数</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">24時間いつでもお買い物</span>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
              <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>

          {/* Features Grid */}
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">楽天市場の魅力</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">楽天ポイント</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  お買い物で楽天ポイントが貯まり、次回のお買い物で1ポイント1円として使えます
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm6 14H8a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h2v1a1 1 0 0 0 2 0V9h2v10a1 1 0 0 1-1 1z"/>
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">豊富な品揃え</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  ファッション、グルメ、家電、本など、あらゆるジャンルの商品が揃っています
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L9 9l-8 3 8 3 3 8 3-8 8-3-8-3-3-8z"/>
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">お得なキャンペーン</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  楽天スーパーセールやお買い物マラソンなど、定期的にお得なイベントを開催
                </p>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-gray-50 px-8 py-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">人気カテゴリー</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'ファッション', icon: '👗', color: 'from-pink-400 to-pink-500' },
                { name: '家電・PC', icon: '💻', color: 'from-blue-400 to-blue-500' },
                { name: 'グルメ・食品', icon: '🍱', color: 'from-orange-400 to-orange-500' },
                { name: '本・雑誌', icon: '📚', color: 'from-purple-400 to-purple-500' },
                { name: '美容・コスメ', icon: '💄', color: 'from-rose-400 to-rose-500' },
                { name: 'スポーツ', icon: '⚽', color: 'from-green-400 to-green-500' },
                { name: 'ホーム・生活', icon: '🏠', color: 'from-yellow-400 to-yellow-500' },
                { name: '車・バイク', icon: '🚗', color: 'from-gray-400 to-gray-500' },
              ].map((category, index) => (
                <div key={index} className={`bg-gradient-to-br ${category.color} rounded-xl p-6 text-white text-center hover:transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg`}>
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <div className="font-semibold text-sm">{category.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="px-8 py-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">今すぐ楽天市場でお買い物を始めよう！</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              楽天ポイントを貯めて、お得にお買い物。日本最大級のオンラインショッピングモールで、あなたの欲しいものがきっと見つかります。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg">
                楽天市場で買い物する
              </button>
              <div className="text-sm text-gray-500">
                ※このページからアクセスすると自動的にリダイレクトされます
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
