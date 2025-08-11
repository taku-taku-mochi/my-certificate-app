// app/certificate/[id]/page.js

async function getData(id) {
  // --- ▼ここからデバッグログ▼ ---
  console.log(`[DEBUG] Function started for ID: ${id}`);
  
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  console.log(`[DEBUG] AIRTABLE_BASE_ID: ${baseId}`);
  console.log(`[DEBUG] AIRTABLE_TABLE_ID: ${tableId}`);
  console.log(`[DEBUG] AIRTABLE_API_KEY is loaded: ${!!apiKey}`); // APIキー自体は表示せず、存在するか否かだけ確認
  // --- ▲ここまでデバッグログ▲ ---

  // 環境変数が一つでもなければ、エラーを投げて処理を中断
  if (!baseId || !tableId || !apiKey) {
    console.error('[ERROR] Environment variables are missing!');
    throw new Error('Server configuration error: Missing environment variables.');
  }

  const fetchUrl = `https://api.airtable.com/v0/${baseId}/${tableId}?filterByFormula={CNo}='${id}'`;
  console.log(`[DEBUG] Fetching URL: ${fetchUrl}`);

  const res = await fetch(fetchUrl, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    next: { revalidate: 10 } //キャッシュの秒数
  });

  if (!res.ok) {
    console.error(`[ERROR] Airtable API responded with status: ${res.status}`);
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  return data.records;
}

export default async function CertificatePage({ params }) {
  const records = await getData(params.id);
  // ... JSXを返す部分 ...
}

// ... ページコンポーネントはそのまま

export default async function CertificatePage({ params }) {
  let certificateData = null;
  try {
    certificateData = await getCertificateData(params.id);
  } catch (error) {
    console.error(error);
  }

  if (!certificateData || !certificateData['CNo']) {
    return <div>鑑定書が見つかりません。</div>;
  }

  return (
    <div>
      <h1>宝石鑑別書</h1>
      <p>証書No: {certificateData['CNo']}</p>
      <p>鑑別結果: {certificateData['Conclusion']}</p>
      <p>形状: {certificateData['Shape_Cut']}</p>
      <p>重量: {certificateData['Weight']}</p>
    </div>
  );
}