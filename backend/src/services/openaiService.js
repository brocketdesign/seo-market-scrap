require('dotenv').config(); // Load environment variables from .env file

const OpenAI = require('openai');
const { logError } = require('./errorService');
const { z } = require('zod');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const categories = [
  { name: "総合", href: "/ja/tags/総合", icon: "🛍️" },
  { name: "ファッション", href: "/ja/tags/ファッション", icon: "👕" },
  { name: "食品", href: "/ja/tags/食品", icon: "🍎" },
  { name: "アウトドア・釣り・旅行用品", href: "/ja/tags/アウトドア", icon: "🏕️" },
  { name: "ダイエット・健康グッズ", href: "/ja/tags/健康", icon: "💪" },
  { name: "コスメ・美容・ヘアケア", href: "/ja/tags/美容", icon: "💄" },
  { name: "スマホ・タブレット・パソコン", href: "/ja/tags/デジタル", icon: "📱" },
  { name: "テレビ・オーディオ・カメラ", href: "/ja/tags/家電", icon: "📺" },
  { name: "家電", href: "/ja/tags/家電", icon: "🔌" },
  { name: "家具・インテリア用品", href: "/ja/tags/インテリア", icon: "🪑" },
  { name: "花・ガーデニング用品", href: "/ja/tags/ガーデニング", icon: "🌻" },
  { name: "キッチン・日用品・文具", href: "/ja/tags/キッチン", icon: "🍴" },
  { name: "DIY・工具", href: "/ja/tags/DIY", icon: "🔧" },
  { name: "ペット用品・生き物", href: "/ja/tags/ペット", icon: "🐶" },
  { name: "楽器・手芸・コレクション", href: "/ja/tags/趣味", icon: "🎸" },
  { name: "ゲーム・おもちゃ", href: "/ja/tags/ゲーム", icon: "🎮" },
  { name: "ベビー・キッズ・マタニティ", href: "/ja/tags/ベビー", icon: "👶" },
  { name: "スポーツ用品", href: "/ja/tags/スポーツ", icon: "⚽" },
  { name: "車・バイク・自転車", href: "/ja/tags/自動車", icon: "🚗" },
  { name: "CD・音楽ソフト", href: "/ja/tags/音楽", icon: "🎵" },
  { name: "DVD・映像ソフト", href: "/ja/tags/映像", icon: "📀" },
  { name: "本・雑誌・コミック", href: "/ja/tags/本", icon: "📚" },
];

const CategoryAndTagsSchema = z.object({
  category: z.string().default('総合'),
  tags: z.array(z.string()).default([]),
});

/**
 * Categorize a product using the OpenAI API.
 * @param {string} title - The title of the product.
 * @returns {Promise<{ category: string, tags: string[] }>} - The category and tags for the product.
 */
async function categorizeProduct(title) {
    try {
        if (!openai.apiKey) {
            throw new Error("OPENAI_API_KEY is not set");
        }

        const prompt = `Given the product title: "${title}", determine the most appropriate category and some relevant tags.
            The possible categories are: ${categories.map(c => c.name).join(', ')}.
            Respond with a JSON object containing the category name and a list of tags.`;

        console.log(`[OpenAiService] Requesting categorization for title: "${title}"`);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        const parsedContent = JSON.parse(content);

        const result = CategoryAndTagsSchema.parse(parsedContent);

        console.log(`[OpenAiService] Categorized as: ${result.category}, tags: ${result.tags.join(', ')}`);

        return { category: result.category, tags: result.tags };
    } catch (error) {
        logError(error, 'categorizeProduct', { title });
        console.log(`[OpenAiService] Error categorizing "${title}": ${error.message}`);
        return { category: '総合', tags: [] }; // Provide default values in case of error
    }
}

module.exports = {
  categorizeProduct
};
