'use client';

import { generateSEOMetadata } from '@/lib/seo';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Rakurabu.comについて
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">私たちのサービス</h2>
              <p className="text-gray-700 mb-4">
                Rakurabu.comは、日本の主要オンラインショッピングサイトの商品情報を一箇所で検索・比較できるサービスです。
                Amazon、楽天市場、Yahoo!ショッピングなどの大手通販サイトから商品データを収集し、
                最安値情報やお得な商品を簡単に見つけることができます。
              </p>
              <p className="text-gray-700 mb-4">
                毎日更新される商品情報により、リアルタイムの価格比較が可能です。
                時間をかけて複数のサイトを巡回する必要がなく、効率的なオンラインショッピングを支援します。
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">主な機能</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-medium mb-3 text-gray-800">商品検索機能</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>キーワードによる横断検索</li>
                    <li>カテゴリー別商品閲覧</li>
                    <li>価格帯による絞り込み</li>
                    <li>人気ランキング表示</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-3 text-gray-800">価格比較機能</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>複数サイトの価格比較</li>
                    <li>最安値情報の表示</li>
                    <li>セール・割引情報</li>
                    <li>価格変動の追跡</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">対応ショップ</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-2 text-orange-800">Amazon</h3>
                  <p className="text-orange-700 text-sm">
                    世界最大級のオンラインマーケットプレイス。
                    豊富な商品ラインナップと迅速な配送が特徴。
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-2 text-red-800">楽天市場</h3>
                  <p className="text-red-700 text-sm">
                    日本最大級のインターネットショッピングモール。
                    楽天ポイントが貯まってお得。
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-2 text-purple-800">Yahoo!ショッピング</h3>
                  <p className="text-purple-700 text-sm">
                    PayPayボーナスが貯まる総合ショッピングサイト。
                    多彩なキャンペーンが魅力。
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">免責事項</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="space-y-3 text-gray-700 text-sm">
                  <li>• 商品価格や在庫状況は各ショップの情報を元にしており、リアルタイムで更新されていますが、実際の価格と異なる場合があります。</li>
                  <li>• 本サイトは商品の仲介は行わず、各ショップへのリンクを提供するサービスです。</li>
                  <li>• 実際の購入は各ショップのサイトで行われ、取引に関するトラブルについては当サイトは責任を負いかねます。</li>
                  <li>• 価格情報は参考目安であり、最終的な価格は各ショップでご確認ください。</li>
                  <li>• 商品情報の正確性については最善を尽くしていますが、完全性を保証するものではありません。</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">お問い合わせ</h2>
              <p className="text-gray-700 mb-4">
                サービスに関するご質問やご要望がございましたら、お気軽にお問い合わせください。
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-blue-800 font-medium">お問い合わせ先</p>
                <p className="text-blue-700">Email: support@rakurabu.com</p>
                <p className="text-blue-700 text-sm mt-2">
                  ※お返事までに数日いただく場合がございます。予めご了承ください。
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
