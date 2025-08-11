// --- データ取得関数 ---
// この関数はサーバーサイドでのみ実行されます。
const getCertificateData = async (recordId) => {
  // 1. 環境変数が読み込まれているかを確認
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  console.log('--- [Step 1] getCertificateData started ---');
  console.log(`Fetching by Record ID: ${recordId}`);
  console.log(`Base ID loaded: ${!!baseId}`);
  console.log(`Table ID loaded: ${!!tableId}`);
  console.log(`API Key loaded: ${!!apiKey}`);

  // 2. 環境変数が一つでも欠けていたら、エラーを投げて処理を中断
  if (!baseId || !tableId || !apiKey) {
    const errorMessage = 'Server configuration error: Environment variables are missing.';
    console.error(`[FATAL ERROR] ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // 3. AirtableにリクエストするURLを組み立て（レコードIDで直接取得）
  const fetchUrl = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordId}`;
  console.log(`--- [Step 2] Fetching URL ---`);
  console.log(fetchUrl);

  try {
    // 4. Airtable APIにリクエストを送信
    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    });

    console.log(`--- [Step 3] Airtable API Response Status ---`);
    console.log(`Status: ${response.status} ${response.statusText}`);

    // 5. レスポンスが正常でない場合 (404 Not Foundなど)
    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API ERROR] Airtable responded with an error:', JSON.stringify(errorData, null, 2));
      return null;
    }

    // 6. レスポンスをJSONとして解析
    const data = await response.json();
    console.log('--- [Step 4] Airtable API Response Data ---');
    console.log(JSON.stringify(data, null, 2));

    // 7. 取得したレコードデータを返す
    return data;

  } catch (error) {
    console.error('--- [CRITICAL FETCH ERROR] ---');
    console.error('Failed to fetch from Airtable. This could be a network issue, DNS problem, or incorrect URL.');
    console.error(error);
    throw error;
  }
};


// --- ページコンポーネント ---
// このコンポーネントがページのUIを描画します。
export default async function CertificatePage({ params }) {
  console.log('--- Page component rendering ---');
  let certificateData = null;
  let errorMessage = '';

  try {
    // サーバーサイドでデータ取得関数を呼び出す
    certificateData = await getCertificateData(params.id);
    if (!certificateData) {
      errorMessage = '鑑定書が見つかりません。IDまたはQRコードが正しいかご確認ください。';
    }
  } catch (error) {
    console.error('Error in CertificatePage:', error.message);
    errorMessage = 'データの取得中にエラーが発生しました。しばらくしてからもう一度お試しください。';
  }

  // 鑑定書が見つかった場合の表示
  if (certificateData) {
    const fields = certificateData.fields;
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '2rem', border: '1px solid #ccc', margin: '2rem', borderRadius: '8px' }}>
        <h1 style={{textAlign: 'center', borderBottom: '2px solid #eee', paddingBottom: '1rem'}}>宝石鑑別書</h1>
        <div style={{ padding: '1rem 0' }}>
            <p><strong>証書No:</strong> {fields.CNo || 'N/A'}</p>
            <p><strong>鑑別結果:</strong> {fields.Conclusion || 'N/A'}</p>
            <p><strong>形状:</strong> {fields.Shape_Cut || 'N/A'}</p>
            <p><strong>重量:</strong> {fields.Weight || 'N/A'}</p>
        </div>
      </div>
    );
  }

  // エラーまたはデータが見つからない場合の表示
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', color: 'red', textAlign: 'center' }}>
      <h1>エラー</h1>
      <p>{errorMessage}</p>
    </div>
  );
}
