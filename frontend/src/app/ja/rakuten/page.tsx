'use client';

import TokenRedirect from '@/components/TokenRedirect';
import { useState } from 'react';

export default function RakutenPage() {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <>
      <head>
        <title>楽天市場価格比較 | 最安値検索・お得情報 - RakuRabu</title>
        <meta name="description" content="楽天市場の商品価格を比較して最安値を見つけよう！楽天ポイント最大化のコツやお得なキャンペーン情報をチェック。賢いオンラインショッピングガイド付き。" />
        <meta name="keywords" content="楽天市場, 価格比較, 最安値, 楽天ポイント, オンラインショッピング, お得情報" />
        <meta property="og:title" content="楽天市場価格比較 | 最安値検索・お得情報 - RakuRabu" />
        <meta property="og:description" content="楽天市場の商品価格を比較して最安値を見つけよう！楽天ポイント最大化のコツやお得なキャンペーン情報をチェック。" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/ja/rakuten" />
      </head>
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        {/* Token Redirect Component - handles automatic redirection silently */}
        <TokenRedirect 
          pageId={301} // Rakuten affiliate ID
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              楽天市場価格比較ガイド
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              楽天市場で最安値を見つけよう！価格比較とお得な買い物のコツを紹介。楽天ポイントを最大限活用して賢くショッピング
            </p>
            
            {/* flex center div container*/}
            <div className="flex justify-center mt-6">
              
              <a href="https://rpx.a8.net/svt/ejp?a8mat=455G3P+70FU1M+2HOM+656YP&rakuten=y&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F0ea62065.34400275.0ea62066.204f04c0%2Fa25051679799_455G3P_70FU1M_2HOM_656YP%3Fpc%3Dhttp%253A%252F%252Fwww.rakuten.co.jp%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252F" rel="nofollow">
              <img src="http://hbb.afl.rakuten.co.jp/hsb/0ec09ba3.bc2429d5.0eb4bbaa.95151395/" border="0"/></a>
              <img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=455G3P+70FU1M+2HOM+656YP" alt=""/>
              <a href="https://rpx.a8.net/svt/ejp?a8mat=455G3P+70FU1M+2HOM+656YP&rakuten=y&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F0ea62065.34400275.0ea62066.204f04c0%2Fa25051679799_455G3P_70FU1M_2HOM_656YP%3Fpc%3Dhttp%253A%252F%252Fwww.rakuten.co.jp%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252F" rel="nofollow">
              <img src="http://hbb.afl.rakuten.co.jp/hsb/0ec09ba3.bc2429d5.0eb4bbaa.95151395/" border="0"/></a>
              <img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=455G3P+70FU1M+2HOM+656YP" alt=""/>
              <a href="https://rpx.a8.net/svt/ejp?a8mat=455G3P+70FU1M+2HOM+656YP&rakuten=y&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F0ea62065.34400275.0ea62066.204f04c0%2Fa25051679799_455G3P_70FU1M_2HOM_656YP%3Fpc%3Dhttp%253A%252F%252Fwww.rakuten.co.jp%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252F" rel="nofollow">
              <img src="http://hbb.afl.rakuten.co.jp/hsb/0ec09ba3.bc2429d5.0eb4bbaa.95151395/" border="0"/></a>
              <img border="0" width="1" height="1" src="https://www19.a8.net/0.gif?a8mat=455G3P+70FU1M+2HOM+656YP" alt=""/>

            </div>
            {/* Simplified affiliate section */}
            <div className="flex justify-center mt-8">

              <a href="https://rpx.a8.net/svt/ejp?a8mat=455G3P+70FU1M+2HOM+656YP&rakuten=y&a8ejpredirect=http%3A%2F%2Fhb.afl.rakuten.co.jp%2Fhgc%2F0ea62065.34400275.0ea62066.204f04c0%2Fa25051679799_455G3P_70FU1M_2HOM_656YP%3Fpc%3Dhttp%253A%252F%252Fwww.rakuten.co.jp%252F%26m%3Dhttp%253A%252F%252Fm.rakuten.co.jp%252F" rel="nofollow" className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg">
                楽天市場で価格をチェック
              </a>
            </div>
          </header>

          {/* Main Content */}
          <main className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-red-500 to-red-600 px-8 py-12 text-white">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">賢い楽天ショッピング術</h2>
                <p className="text-red-100 text-lg mb-6">
                  価格比較で最安値を見つけて、楽天ポイントを最大限活用する方法をご紹介
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm font-medium">価格比較機能</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm font-medium">ポイント最大化</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-sm font-medium">お得情報配信</span>
                  </div>
                </div>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
                <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </section>

            {/* 楽天市場の魅力 */}
            <section className="p-8">
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
            </section>

            {/* Shopping Tips Section */}
            <section className="bg-blue-50 px-8 py-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">オンラインショッピングのコツ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-500 font-bold">1</span>
                    </div>
                    <h4 className="text-lg font-semibold">価格比較を忘れずに</h4>
                  </div>
                  <p className="text-gray-600 text-sm">同じ商品でも店舗によって価格が異なります。複数のショップを比較して最安値を見つけましょう。送料も含めた総額で比較することが重要です。</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-green-500 font-bold">2</span>
                    </div>
                    <h4 className="text-lg font-semibold">ポイントアップデーを活用</h4>
                  </div>
                  <p className="text-gray-600 text-sm">楽天スーパーセールやお買い物マラソンなど、ポイントアップキャンペーンの日程をチェック。最大44倍のポイントが獲得できる場合もあります。</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-yellow-500 font-bold">3</span>
                    </div>
                    <h4 className="text-lg font-semibold">レビューをしっかり確認</h4>
                  </div>
                  <p className="text-gray-600 text-sm">購入前には必ず商品レビューと店舗評価をチェック。実際の利用者の声は商品選びの重要な判断材料になります。</p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-purple-500 font-bold">4</span>
                    </div>
                    <h4 className="text-lg font-semibold">楽天カード活用術</h4>
                  </div>
                  <p className="text-gray-600 text-sm">楽天カードでの決済でさらにポイントアップ。SPU（スーパーポイントアッププログラム）を活用すれば常時ポイント倍率が上がります。</p>
                </div>
              </div>
            </section>

            {/* 人気カテゴリー */}
            <section className="bg-gray-50 px-8 py-12">
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
                  <div key={index} className={`bg-gradient-to-br ${category.color} rounded-xl p-6 text-white text-center hover:transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg`} onClick={() => window.location.href = `/ja/search?q=${encodeURIComponent(category.name)}`}>
                    <div className="text-3xl mb-3">{category.icon}</div>
                    <div className="font-semibold text-sm">{category.name}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section className="px-8 py-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">よくある質問</h3>
              <div className="max-w-4xl mx-auto">
                {[
                  {
                    question: "楽天ポイントを最も効率的に貯める方法は？",
                    answer: "楽天スーパーセールやお買い物マラソンの期間中に、楽天カードで決済し、SPUの条件を満たすことで最大44倍のポイントを獲得できます。また、定期的に開催される0と5のつく日にエントリーすることも重要です。"
                  },
                  {
                    question: "同じ商品なのに価格が違うのはなぜ？",
                    answer: "楽天市場は複数のショップが出店するモール型ECサイトのため、店舗ごとに価格設定が異なります。送料、ポイント倍率、付属品の有無なども含めて総合的に比較することをおすすめします。"
                  },
                  {
                    question: "安全な店舗の見分け方は？",
                    answer: "店舗評価が4.0以上、レビュー数が多い、楽天市場の認定マーク（楽天スーパーDEAL等）がある店舗を選びましょう。また、返品・交換ポリシーが明記されているかも確認してください。"
                  },
                  {
                    question: "送料を節約する方法は？",
                    answer: "送料無料ラインを満たすまでまとめ買いをする、送料無料商品を選ぶ、楽天プレミアムで送料特典を利用するなどの方法があります。また、同一店舗での複数購入で送料がお得になる場合もあります。"
                  }
                ].map((faq, index) => (
                  <div key={index} className="mb-4 border border-gray-200 rounded-lg">
                    <button
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      onClick={() => toggleAccordion(index)}
                    >
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform ${
                          activeAccordion === index ? 'rotate-180' : ''
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {activeAccordion === index && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="px-8 py-12 text-center bg-gradient-to-r from-red-500 to-red-600 text-white">
              <h3 className="text-2xl font-bold mb-4">今すぐ楽天市場で最安値をチェック！</h3>
              <p className="mb-8 max-w-2xl mx-auto">
                価格比較で賢くお買い物。楽天ポイントを最大限活用して、お得にショッピングを楽しみましょう。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  className="bg-white text-red-500 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
                  onClick={() => window.open('https://www.rakuten.co.jp/', '_blank')}
                >
                  楽天市場で価格をチェック
                </button>
                <a 
                  href="/ja/search" 
                  className="border-2 border-white text-white hover:bg-white hover:text-red-500 font-bold py-4 px-8 rounded-lg text-lg transition-colors"
                >
                  商品を検索する
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
