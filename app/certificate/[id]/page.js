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

  // --- スタイル定義 (提供されたHTML参考) ---
  const pageStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9', // bg-gray-100
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    padding: '1rem',
  };

  const cardStyles = {
    width: '100%',
    maxWidth: '448px', // max-w-md
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem', // rounded-lg
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-xl
    padding: '2.5rem', // p-8から上下の余白を増やす
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: '1.5rem', // mb-6
  };

  const titleStyles = {
    fontSize: '1.5rem', // text-2xl
    fontWeight: 'bold',
    color: '#1f2937', // text-gray-800
  };

  const idStyles = {
    fontSize: '0.875rem', // text-sm
    color: '#6b7280', // text-gray-500
    marginTop: '0.25rem', // mt-1
  };
  
  const imageContainerStyles = {
    marginBottom: '1.5rem', // mb-6
  };

  const imageStyles = {
    width: '100%',
    height: 'auto',
    borderRadius: '0.5rem', // rounded-lg
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
  };

  const detailsContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem', // space-y-4
  };

  const itemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e5e7eb', // border-b
    paddingBottom: '0.5rem', // pb-2
  };
  
  const labelStyles = {
    fontWeight: '600', // font-semibold
    color: '#4b5563', // text-gray-600
  };

  const valueStyles = {
    color: '#1f2937', // text-gray-800
    fontWeight: '500', // font-medium
  };

  const conclusionValueStyles = {
    ...valueStyles,
    fontSize: '1.2rem', // フォントを少し大きくする
  };
  
  const commentContainerStyles = {
    // No direct equivalent for space-y-4 on the parent, so handle margin individually
  };

  const commentLabelStyles = {
    fontWeight: '600',
    color: '#4b5563',
  };

  const commentTextStyles = {
    backgroundColor: '#f9fafb', // bg-gray-50
    padding: '0.75rem', // p-3
    borderRadius: '0.375rem', // rounded-md
    marginTop: '0.25rem', // mt-1
    color: '#1f2937',
  };

  const errorContainerStyles = {
    textAlign: 'center',
    padding: '2rem',
    width: '100%',
    maxWidth: '500px',
  };

  const errorStyles = {
    backgroundColor: '#fff0f0',
    color: '#d8000c',
    padding: '3rem',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  };


  // 鑑定書が見つかった場合の表示
  if (certificateData) {
    const fields = certificateData.fields;
    const imageUrl = fields.Image && fields.Image.length > 0 ? fields.Image[0].url : 'https://placehold.co/600x400/e2e8f0/a0aec0?text=No+Image';

    return (
      <main style={pageStyles}>
        <div style={cardStyles}>
          <div style={headerStyles}>
            <h1 style={titleStyles}>Certificate Data</h1>
            <p style={idStyles}>- Certificate No: {fields.CNo || 'N/A'} -</p>
          </div>

          <div style={imageContainerStyles}>
            <img src={imageUrl} alt={fields.Conclusion || 'Gemstone'} style={imageStyles} />
          </div>

          <div style={detailsContainerStyles}>
            <div style={itemStyles}>
              <span style={labelStyles}>Conclusion:</span>
              <span style={conclusionValueStyles}>{fields.Conclusion || 'N/A'}</span>
            </div>
            <div style={itemStyles}>
              <span style={labelStyles}>Weight:</span>
              <span style={valueStyles}>{fields.Weight || 'N/A'}</span>
            </div>
            <div style={itemStyles}>
              <span style={labelStyles}>Shape & Cut:</span>
              <span style={valueStyles}>{fields.Shape_Cut || 'N/A'}</span>
            </div>
            
            {/* コメントがある場合のみ、このブロック全体を表示 */}
            {fields.Comment && (
              <div style={commentContainerStyles}>
                <span style={commentLabelStyles}>Comment:</span>
                <p style={commentTextStyles}>{fields.Comment}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // エラーまたはデータが見つからない場合の表示
  return (
    <main style={pageStyles}>
        <div style={errorContainerStyles}>
            <div style={errorStyles}>
                <h2>エラー</h2>
                <p>{errorMessage}</p>
            </div>
        </div>
    </main>
  );
}
