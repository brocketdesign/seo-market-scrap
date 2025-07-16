'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            プライバシーポリシー
          </h1>
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. プライバシー情報</h2>
              <p className="text-gray-700">
                プライバシー情報のうち「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報を指します。
              </p>
              <p className="text-gray-700">
                プライバシー情報のうち「履歴情報および特性情報」とは、上記に定める「個人情報」以外のものをいい、ご利用いただいたサービスやご購入いただいた商品、ご覧になったページや広告の履歴、検索キーワード、ご利用日時、ご利用方法、ご利用環境（OS、ブラウザの種類、IPアドレス、Cookie情報、端末の個体識別情報など）などを指します。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. 個人情報の収集方法</h2>
              <p className="text-gray-700">
                当サイトでは、ユーザーが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレスなどの個人情報をお尋ねすることがあります。また、ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や、決済に関する情報を当社の提携先（情報提供元、広告主、広告配信先などを含みます。）などから収集することがあります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. 個人情報を収集・利用する目的</h2>
              <p className="text-gray-700">
                当サイトが個人情報を収集・利用する目的は以下のとおりです。
              </p>
              <ul className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>(1) ユーザーに自分の登録情報の閲覧や修正、利用状況の閲覧を行っていただくために、氏名、住所、連絡先、支払方法などの登録情報、利用されたサービスや購入された商品、およびそれらの代金などに関する情報を表示する目的</li>
                <li>(2) ユーザーにお知らせや連絡をするためにメールアドレスを利用する場合やユーザーに商品を送付したり必要に応じて連絡したりするため、氏名や住所などの連絡先情報を利用する目的</li>
                <li>(7) ユーザーからのお問い合わせに対応するために、お問い合わせ内容や代金の請求に関する情報など当社がユーザーに対してサービスを提供するにあたって必要となる情報や、ユーザーのサービス利用状況、連絡先情報などを利用する目的</li>
                <li>(8) 上記の利用目的に付随する目的</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. 個人情報の第三者提供</h2>
              <p className="text-gray-700">
                当サイトは、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
              </p>
              <ul className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>(1) 法令に基づく場合</li>
                <li>(2) 人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>(3) 公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>(4) 国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
              <p className="text-gray-700">
                予め次の事項を告知あるいは公表をしている場合
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>利用目的に第三者への提供を含むこと</li>
                <li>第三者に提供されるデータの項目</li>
                <li>第三者への提供の手段または方法</li>
                <li>本人の求めに応じて個人情報の第三者への提供を停止すること</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. 個人情報の開示</h2>
              <p className="text-gray-700">
                当社は，本人から個人情報の開示を求められたときは，本人に対し，遅滞なくこれを開示します。ただし，開示することにより次のいずれかに該当する場合は，その全部または一部を開示しないこともあり，開示しない決定をした場合には，その旨を遅滞なく通知します。
              </p>
              <ul className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>(1) 本人または第三者の生命，身体，財産その他の権利利益を害するおそれがある場合</li>
                <li>(2) 当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                <li>(3) その他法令に違反することとなる場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Cookie（クッキー）について</h2>
              <p className="text-gray-700">
                当サイトでは、利便性向上や広告配信、アクセス解析のためにCookieを使用しています。Cookieは、ウェブサイトのサーバーがお客様のブラウザに送信する小さなデータファイルで、お客様のコンピューターに保存されます。Cookieには、お客様のIPアドレス、ブラウザの種類、アクセス日時などの情報が含まれますが、個人を特定する情報は含まれていません。
              </p>
              <p className="text-gray-700">
                お客様は、ブラウザの設定を変更することにより、Cookieの受け入れを拒否することができます。ただし、Cookieを無効にすると、当サイトの一部機能が利用できなくなる場合があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. アフィリエイトプログラムについて</h2>
              <p className="text-gray-700">
                当サイトは、商品やサービスを紹介する際にアフィリエイトリンク（Value Commerce、A8.net、Amazonアソシエイト、楽天アフィリエイト、Yahoo!ショッピングなど日本の主要アフィリエイトプログラム）を利用しています。リンク経由で商品を購入された場合、当サイトが報酬を受け取ることがあります。商品やサービスに関するお問い合わせは、各販売元へお願いいたします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. 免責事項</h2>
              <p className="text-gray-700">
                当サイトで掲載している情報の正確性については万全を期しておりますが、利用者が当サイトの情報を用いて行う一切の行為について、何ら責任を負うものではありません。
              </p>
              <p className="text-gray-700">
                当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. お問い合わせ</h2>
              <p className="text-gray-700">
                プライバシーポリシーに関するご質問は、<a href="mailto:support@rakurabu.com" className="text-blue-700 underline">support@rakurabu.com</a> までご連絡ください。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
