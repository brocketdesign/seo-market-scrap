export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          CSS テスト
        </h1>
        <p className="text-gray-700 mb-4">
          このページでTailwind CSSが正常に読み込まれているかテストします。
        </p>
        <div className="space-y-2">
          <div className="bg-red-100 text-red-800 p-2 rounded">赤色のテスト</div>
          <div className="bg-green-100 text-green-800 p-2 rounded">緑色のテスト</div>
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded">黄色のテスト</div>
        </div>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          ボタンテスト
        </button>
      </div>
    </div>
  );
}
