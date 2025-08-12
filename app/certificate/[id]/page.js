// page.js (Server Component)
// このファイルは、クライアントコンポーネントを呼び出すだけのシンプルな役割になります。

import CertificateView from './CertificateView';

export default function CertificatePage({ params }) {
  // URLから取得したIDを、表示担当のコンポーネントに渡します。
  return <CertificateView recordId={params.id} />;
}
