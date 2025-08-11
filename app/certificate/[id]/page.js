// app/certificate/[id]/page.js

async function getCertificateData(id) {
  // 環境変数を使ってホスト名を取得
  const host = process.env.NEXT_PUBLIC_VERCEL_URL ? 
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 
    'http://localhost:3000';

  const res = await fetch(`${host}/api/certificate?id=${id}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  const data = await res.json();
  return data;
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