// 'use client' を先頭に記述し、ブラウザで動作するコンポーネントであることを明示します。
'use client';

import { useState, useEffect } from 'react';

// --- 翻訳データ ---
const translations = {
  ja: {
    title: '鑑別データ',
    certNo: '証書No',
    conclusion: '鑑別結果',
    weight: '重量',
    shapeCut: '形状 & カット',
    comment: 'コメント',
    errorTitle: 'エラー',
    errorNotFound: '鑑定書が見つかりません。IDまたはQRコードが正しいかご確認ください。',
    errorFetch: 'データの取得中にエラーが発生しました。しばらくしてからもう一度お試しください。',
    loading: '読み込み中...'
  },
  en: {
    title: 'Certificate Data',
    certNo: 'Certificate No',
    conclusion: 'Conclusion',
    weight: 'Weight (ct)',
    shapeCut: 'Shape & Cut',
    comment: 'Comment',
    errorTitle: 'Error',
    errorNotFound: 'Certificate not found. Please check the ID or QR code.',
    errorFetch: 'An error occurred while fetching data. Please try again later.',
    loading: 'Loading...'
  },
  zh: {
    title: '证书数据',
    certNo: '证书编号',
    conclusion: '结论',
    weight: '重量 (ct)',
    shapeCut: '形状与切工',
    comment: '评论',
    errorTitle: '错误',
    errorNotFound: '未找到证书。请检查ID或二维码。',
    errorFetch: '获取数据时发生错误。请稍后再试。',
    loading: '加载中...'
  }
};

// --- 各デザインテーマのスタイル定義 ---

// A案: ミニマリスト ＆ ラグジュアリー
const themeAStyles = {
  page: {
    backgroundColor: '#1a1a1a', // Dark background
  },
  card: {
    backgroundColor: '#2b2b2b',
    border: '1px solid #444',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  },
  title: {
    color: '#d4af37', // Gold color
    fontWeight: '300',
    letterSpacing: '0.1em',
  },
  id: {
    color: '#aaa',
  },
  label: {
    color: '#aaa',
  },
  value: {
    color: '#f0f0f0',
  },
  conclusionValue: {
    color: '#d4af37',
    fontSize: '1.5rem',
  },
  divider: {
    borderColor: '#444',
  }
};

// B案：クラシック ＆ オーセンティック
const themeBStyles = {
  page: {
    backgroundColor: '#fdfaee', // Parchment color
  },
  card: {
    backgroundColor: '#ffffff',
    border: '8px double #c0a080', // Ornate double border
    padding: '3rem',
  },
  title: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: '#5d4037',
  },
  id: {
    color: '#795548',
  },
  label: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: '#795548',
  },
  value: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: '#3e2723',
  },
  conclusionValue: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: '#5d4037',
    fontSize: '1.5rem',
  },
  divider: {
    borderColor: '#d7ccc8',
  }
};

// C案：フォトグラフィック ＆ ダイナミック (デフォルト)
const themeCStyles = {
  page: {
    backgroundColor: '#f1f5f9',
  },
  card: {
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  title: {
    color: '#1f2937',
  },
  id: {
    color: '#6b7280',
  },
  label: {
    color: '#4b5563',
  },
  value: {
    color: '#1f2937',
  },
  conclusionValue: {
    color: '#1f2937',
    fontSize: '1.2rem',
  },
  divider: {
    borderColor: '#e5e7eb',
  }
};


// --- 表示担当のコンポーネント ---
export default function CertificateView({ recordId }) {
  const [language, setLanguage] = useState('ja');
  const [certificateData, setCertificateData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState(themeCStyles); // デフォルトテーマを設定

  useEffect(() => {
    const getCertificateData = async (id, lang) => {
      if (!id) return;
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await fetch(`/api/certificate/${id}?lang=${lang}`);
        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.message || 'Failed to fetch data');
        }
        const data = await response.json();
        setCertificateData(data);

        // ★★★ Airtableのテーマ設定に応じてスタイルを切り替え ★★★
        const theme = data.fields['Design Theme'];
        if (theme === 'A') {
          setActiveTheme(themeAStyles);
        } else if (theme === 'B') {
          setActiveTheme(themeBStyles);
        } else {
          setActiveTheme(themeCStyles); // デフォルトはC
        }

      } catch (error) {
        console.error('Error in CertificateView:', error.message);
        setCertificateData(null);
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    getCertificateData(recordId, language);
  }, [recordId, language]);

  const t = translations[language];

  // --- 汎用スタイル定義 ---
  const pageStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    padding: '1rem',
    transition: 'background-color 0.5s ease',
    ...activeTheme.page, // テーマのスタイルを適用
  };

  const cardStyles = {
    width: '100%',
    maxWidth: '448px',
    borderRadius: '0.5rem',
    padding: '2.5rem',
    transition: 'all 0.5s ease',
    ...activeTheme.card, // テーマのスタイルを適用
  };
  
  // ... (他のスタイル定義は省略)

  if (loading) {
      return <main style={pageStyles}><p style={{color: '#888'}}>{t.loading}</p></main>
  }

  if (errorMessage || !certificateData) {
    // ... (エラー表示部分は省略)
  }

  const fields = certificateData.fields;
  const imageUrl = fields.Image && fields.Image.length > 0 ? fields.Image[0].url : 'https://placehold.co/600x400/e2e8f0/a0aec0?text=No+Image';

  return (
    <main style={pageStyles}>
      <div style={cardStyles}>
        {/* ... (言語ボタン部分は省略) ... */}
        <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', ...activeTheme.title}}>{t.title}</h1>
          <p style={{fontSize: '0.875rem', marginTop: '0.25rem', ...activeTheme.id}}>- {t.certNo}: {fields.CNo || 'N/A'} -</p>
        </div>

        <div style={{marginBottom: '1.5rem'}}>
          <img src={imageUrl} alt={fields.Conclusion || 'Gemstone'} style={{width: '100%', height: 'auto', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}} />
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${activeTheme.divider.borderColor}`, paddingBottom: '0.5rem'}}>
            <span style={{fontWeight: '600', ...activeTheme.label}}>{t.conclusion}:</span>
            <span style={{fontWeight: '500', ...activeTheme.conclusionValue}}>{fields.Conclusion || 'N/A'}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${activeTheme.divider.borderColor}`, paddingBottom: '0.5rem'}}>
            <span style={{fontWeight: '600', ...activeTheme.label}}>{t.weight}:</span>
            <span style={{fontWeight: '500', ...activeTheme.value}}>{fields.Weight || 'N/A'}</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${activeTheme.divider.borderColor}`, paddingBottom: '0.5rem'}}>
            <span style={{fontWeight: '600', ...activeTheme.label}}>{t.shapeCut}:</span>
            <span style={{fontWeight: '500', ...activeTheme.value}}>{fields.Shape_Cut || 'N/A'}</span>
          </div>
          
          {fields.Comment && (
            <div>
              <span style={{fontWeight: '600', ...activeTheme.label}}>{t.comment}:</span>
              <p style={{backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '0.375rem', marginTop: '0.25rem', ...activeTheme.value}}>{fields.Comment}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
