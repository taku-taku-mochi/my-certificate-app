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

  // --- スタイル定義 (画像付き・モダンライトテーマ) ---
  const pageStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#2c3e50',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    padding: '2rem',
  };

  const certificateStyles = {
    width: '100%',
    maxWidth: '800px', // 横幅を広げて画像スペースを確保
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden', // 角丸を維持するため
  };
  
  const contentWrapperStyles = {
      display: 'flex',
      flexDirection: 'row', // 横並びのレイアウト
  };
  
  const imageContainerStyles = {
      flex: '1 1 40%', // 左側の画像エリアの幅
      backgroundColor: '#f9f9f9',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      position: 'relative',
  };

  const imageStyles = {
      width: '100%',
      height: 'auto',
      maxHeight: '400px',
      objectFit: 'contain',
  };

  const detailsContainerStyles = {
      flex: '1 1 60%', // 右側の詳細エリアの幅
      padding: '2.5rem 3.5rem',
  };

  const headerStyles = {
    textAlign: 'left',
    fontSize: '2rem',
    fontWeight: '600',
    color: '#2c3e50',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '1.5rem',
    marginBottom: '2rem',
  };
  
  const itemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.2rem 0',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '1rem',
  };

  const labelStyles = {
    fontWeight: '500',
    color: '#555',
  };

  const valueStyles = {
    fontWeight: '400',
    color: '#333',
  };
  
  const errorContainerStyles = {
    textAlign: 'center',
    padding: '2rem',
    width: '100%',
    maxWidth: '500px',
  };

  const errorStyles = {
    backgroundColor: '#ffffff',
    color: '#d8000c',
    padding: '3rem',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  };


  // 鑑定書が見つかった場合の表示
  if (certificateData) {
    const fields = certificateData.fields;
    // Airtableの添付ファイルフィールドから画像のURLを取得
    const imageUrl = fields.Image && fields.Image.length > 0 ? fields.Image[0].url : null;

    return (
      <main style={pageStyles}>
        <div style={certificateStyles}>
          <div style={contentWrapperStyles}>
            {/* 左側の画像エリア */}
            <div style={imageContainerStyles}>
              {imageUrl ? (
                <img src={imageUrl} alt={fields.Hinmei || 'Gemstone'} style={imageStyles} />
              ) : (
                <div style={{color: '#ccc'}}>画像なし</div>
              )}
            </div>
            
            {/* 右側の詳細エリア */}
            <div style={detailsContainerStyles}>
              <h1 style={headerStyles}>宝石鑑別書</h1>
              <div>
                <div style={itemStyles}>
                  <span style={labelStyles}>証書No:</span>
                  <span style={valueStyles}>{fields.CNo || 'N/A'}</span>
                </div>
                <div style={itemStyles}>
                  <span style={labelStyles}>鑑別結果:</span>
                  <span style={valueStyles}>{fields.Conclusion || 'N/A'}</span>
                </div>
                <div style={itemStyles}>
                  <span style={labelStyles}>形状:</span>
                  <span style={valueStyles}>{fields.Shape_Cut || 'N/A'}</span>
                </div>
                <div style={itemStyles}>
                  <span style={labelStyles}>重量:</span>
                  <span style={valueStyles}>{fields.Weight || 'N/A'}</span>
                </div>
              </div>
            </div>
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
