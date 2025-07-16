'use client';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            お問い合わせ
          </h1>
          <div className="bg-blue-50 p-6 rounded-lg mb-10">
            <p className="text-blue-800 font-medium mb-2">お問い合わせ先</p>
            <p className="text-blue-700">Email: support@rakurabu.com</p>
            <p className="text-blue-700 text-sm mt-2">
              ※お返事までに数日いただく場合がございます。予めご了承ください。
            </p>
          </div>
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">よくあるご質問（FAQ）</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">商品詳細について</h3>
                <p className="text-gray-700 text-sm">
                  掲載されている商品情報は各ショップから取得しています。詳細な仕様や在庫状況、最新の価格については、各ショップの公式ページをご確認ください。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">広告掲載について</h3>
                <p className="text-gray-700 text-sm">
                  Rakurabu.comでは、広告掲載やタイアップのご相談を随時受け付けております。ご希望の方は上記メールアドレスまでご連絡ください。
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
