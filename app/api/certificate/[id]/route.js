import { NextResponse } from 'next/server';

// この関数が /api/certificate/[id] へのリクエストを処理します
// 'export default' を削除し、'export async function GET' に変更
export async function GET(request, { params }) {
  const recordId = params.id; // URLからIDを取得
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'ja'; // URLから言語パラメータを取得、デフォルトは日本語

  // 1. 環境変数が読み込まれているかを確認
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  if (!baseId || !tableId || !apiKey) {
    console.error('[API FATAL ERROR] Server configuration error: Environment variables are missing.');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  const fetchUrl = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;

  try {
    // 2. Airtableから元のデータを取得
    const airtableResponse = await fetch(fetchUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });

    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.json();
      console.error('[API ERROR] Airtable responded with an error:', JSON.stringify(errorData, null, 2));
      return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
    }

    let data = await airtableResponse.json();

    // 3. 言語が日本語以外の場合、AI翻訳を実行
    if (lang !== 'ja' && data.fields) {
      const fieldsToTranslate = {
        Conclusion: data.fields.Conclusion,
        Shape_Cut: data.fields.Shape_Cut,
        'Comment1': data.fields['Comment1'],
        Weight: data.fields.Weight,
      };

      // 翻訳対象のフィールドが存在する場合のみAIを呼び出す
      const translatableEntries = Object.entries(fieldsToTranslate).filter(([key, value]) => value);
      if (translatableEntries.length > 0) {
        const translatableData = Object.fromEntries(translatableEntries);
        
        const targetLanguage = lang === 'en' ? 'English' : 'Chinese';
        const prompt = `Translate the values of the following JSON object from Japanese to ${targetLanguage}. Return the result as a JSON object with the exact same keys. Do not translate the keys. Only translate the string values.\n\nInput: ${JSON.stringify(translatableData)}\n\nOutput:`;

        const geminiApiKey = process.env.GEMINI_API_KEY || ""; 
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;
        
        const geminiResponse = await fetch(geminiApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });

        if (geminiResponse.ok) {
          const geminiResult = await geminiResponse.json();
          try {
            const translatedText = geminiResult.candidates[0].content.parts[0].text;
            // AIの応答からJSON部分だけを抽出する
            const jsonMatch = translatedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const translatedFields = JSON.parse(jsonMatch[0]);
                // 翻訳された結果を元のデータにマージ
                data.fields = { ...data.fields, ...translatedFields };
            } else {
                 console.error("AI response did not contain valid JSON.", translatedText);
            }
          } catch (e) {
            console.error("Error parsing AI translation response:", e);
          }
        } else {
            console.error("AI translation API call failed:", await geminiResponse.text());
        }
      }
    }

    // 4. 最終的なデータをフロントエンドに返す
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API CRITICAL FETCH ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
