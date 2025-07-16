'use client';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            使い方ガイド
          </h1>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">基本的な使い方</h2>
              
              <div className="space-y-8">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-medium mb-3 text-gray-800">1. 商品を検索する</h3>
                  <p className="text-gray-700 mb-3">
                    Rakurabu.com（ラクラブ）のトップページの検索バーにキーワードや商品名を入力して検索できます。
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>検索のコツ：</strong>
                      <br />
                      • 商品名やブランド名で検索すると効果的です
                      <br />
                      • 「ワイヤレスイヤホン」「スニーカー」など一般的なキーワードも使えます
                      <br />
                      • スペースを空けることで複数キーワードでの検索も可能です
                    </p>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-xl font-medium mb-3 text-gray-800">2. カテゴリーから探す</h3>
                  <p className="text-gray-700 mb-3">
                    トップページのカテゴリー一覧から、興味のある分野の商品を閲覧できます。
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">主要カテゴリー</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 家電・デジタル機器</li>
                        <li>• ファッション・アクセサリー</li>
                        <li>• 美容・コスメ・ヘルスケア</li>
                        <li>• スポーツ・アウトドア</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">その他カテゴリー</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 本・雑誌・コミック</li>
                        <li>• ゲーム・おもちゃ</li>
                        <li>• キッチン・日用品</li>
                        <li>• ペット用品</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-xl font-medium mb-3 text-gray-800">3. 価格を比較する</h3>
                  <p className="text-gray-700 mb-3">
                    検索結果では、同じ商品の異なるショップでの価格を比較できます。
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>価格表示について：</strong>
                      <br />
                      • 各商品カードに価格が表示されます
                      <br />
                      • ショップ名（Amazon、楽天市場など）も表示されます
                      <br />
                      • 最安値商品は特別にハイライトされます
                      <br />
                      • クリックすると該当ショップの商品ページに移動します
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">便利な機能</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-medium mb-4 text-gray-800">人気ランキング</h3>
                  <p className="text-gray-700 mb-3">
                    カテゴリー別の人気商品ランキングを確認できます。
                    トレンドや話題の商品を簡単に見つけられます。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-4 text-gray-800">セール情報</h3>
                  <p className="text-gray-700 mb-3">
                    各ショップのセールや割引情報を一覧で確認できます。
                    お得な商品を逃さずチェックしましょう。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-4 text-gray-800">人気キーワード</h3>
                  <p className="text-gray-700 mb-3">
                    よく検索される人気キーワードから商品を探せます。
                    季節のトレンド商品などが見つかります。
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-4 text-gray-800">Amazon割引検索</h3>
                  <p className="text-gray-700 mb-3">
                    Amazonの割引商品を専用の検索機能で見つけられます。
                    お得な商品を効率的に探せます。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">よくある質問</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Q: 商品価格はリアルタイムで更新されますか？</h3>
                  <p className="text-gray-700">
                    A: はい、商品価格情報は定期的に更新されていますが、ショップサイトでの実際の価格と若干の差が生じる場合があります。
                    最終的な価格は必ずショップサイトでご確認ください。
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Q: 商品を購入するにはどうすればいいですか？</h3>
                  <p className="text-gray-700">
                    A: Rakurabu.com（ラクラブ）では商品の販売は行っておりません。商品をクリックすると各ショップの商品ページに移動しますので、
                    そちらで購入手続きを行ってください。
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Q: 送料は価格に含まれていますか？</h3>
                  <p className="text-gray-700">
                    A: 表示価格は商品本体価格のみで、送料は含まれていません。送料についてはそれぞれのショップサイトでご確認ください。
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-2 text-gray-800">Q: 在庫がない商品も表示されますか？</h3>
                  <p className="text-gray-700">
                    A: 在庫情報も定期的に更新していますが、リアルタイムではないため、在庫切れの商品が表示される場合があります。
                    在庫状況は各ショップサイトで最新情報をご確認ください。
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-blue-900">サポートが必要ですか？</h2>
              <p className="text-blue-800 mb-4">
                ご不明な点やご要望がございましたら、お気軽にお問い合わせください。
              </p>
              <a 
                href="/ja/contact" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                お問い合わせページへ
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
