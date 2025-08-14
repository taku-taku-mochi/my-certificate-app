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

// A案: ミニマリスト ＆ ラグジュアリー (改)
const themeAStyles = {
  page: {
    backgroundColor: '#121212', // Slightly deeper black
  },
  card: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
    padding: '3rem', // Increase padding for more space
  },
  title: {
    color: '#e0e0e0',
    fontWeight: '300',
    letterSpacing: '0.15em',
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  id: {
    color: '#888',
  },
  label: {
    color: '#999',
  },
  value: {
    color: '#f5f5f5',
  },
  conclusionValue: {
    color: '#ffffff', // Changed from gold to white
    fontSize: '1.5rem',
  },
  divider: {
    borderColor: '#333',
  }
};

// B案：クラシック ＆ オーセンティック
const themeBStyles = {
  page: {
    backgroundColor: '#fdfaee',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '8px double #c0a080',
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
  const [activeTheme, setActiveTheme] = useState(themeCStyles);

  useEffect(() => {
    const getCertificateData = async (id, lang) => {
      if (!id) return;
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await fetch(`/api/certificate/${id}?lang=${lang}`);
        
        if (!response.ok) {
          let errorText = await response.text();
          let message = translations[lang].errorFetch;
          try {
            const errorResult = JSON.parse(errorText);
            message = errorResult.message || message;
          } catch (e) {
            if (errorText) {
              message = errorText;
            }
          }
          throw new Error(message);
        }

        const data = await response.json();
        setCertificateData(data);

        const theme = data.fields['Design Theme'];
        if (theme === 'A') {
          setActiveTheme(themeAStyles);
        } else if (theme === 'B') {
          setActiveTheme(themeBStyles);
        } else {
          setActiveTheme(themeCStyles);
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
    ...activeTheme.page,
  };

  const cardStyles = {
    width: '100%',
    maxWidth: '560px',
    borderRadius: '0.5rem',
    padding: '2.5rem',
    transition: 'all 0.5s ease',
    ...activeTheme.card,
  };
  
  const langButtonContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  };

  const langButtonStyles = (isActive) => ({
    padding: '0.25rem 0.75rem',
    border: `1px solid ${isActive ? '#3b82f6' : '#d1d5db'}`,
    borderRadius: '0.375rem',
    cursor: 'pointer',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? '#ffffff' : activeTheme.label.color,
    fontSize: '0.875rem',
    transition: 'all 0.2s ease-in-out',
  });
  
  const itemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '1rem 0',
    borderBottom: `1px solid ${activeTheme.divider.borderColor}`,
  };

  const labelStyles = {
    flexShrink: 0,
    paddingRight: '1.5rem',
    fontWeight: '600',
    ...activeTheme.label,
  };

  const valueStyles = {
    textAlign: 'right',
    wordBreak: 'break-word',
    fontWeight: '500',
    ...activeTheme.value,
  };

  const conclusionValueStyles = {
      ...valueStyles,
      ...activeTheme.conclusionValue,
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

  if (loading) {
      return <main style={pageStyles}><p style={{color: '#888'}}>{t.loading}</p></main>
  }

  if (errorMessage || !certificateData) {
    return (
      <main style={pageStyles}>
          <div style={errorContainerStyles}>
              <div style={errorStyles}>
                  <h2>{t.errorTitle}</h2>
                  <p>{errorMessage || t.errorNotFound}</p>
              </div>
          </div>
      </main>
    );
  }

  const fields = certificateData.fields;
  const imageUrl = fields.Image && fields.Image.length > 0 ? fields.Image[0].url : 'https://placehold.co/600x400/e2e8f0/a0aec0?text=No+Image';

  return (
    <main style={pageStyles}>
      <div style={cardStyles}>
        <div style={langButtonContainerStyles}>
          <button style={langButtonStyles(language === 'ja')} onClick={() => setLanguage('ja')}>日本語</button>
          <button style={langButtonStyles(language === 'en')} onClick={() => setLanguage('en')}>English</button>
          <button style={langButtonStyles(language === 'zh')} onClick={() => setLanguage('zh')}>中文</button>
        </div>
        <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
          <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', ...activeTheme.title}}>{t.title}</h1>
          <p style={{fontSize: '0.875rem', marginTop: '0.25rem', ...activeTheme.id}}>- {t.certNo}: {fields.CNo || 'N/A'} -</p>
        </div>

        <div style={{marginBottom: '1.5rem'}}>
          <img src={imageUrl} alt={fields.Conclusion || 'Gemstone'} style={{width: '100%', height: 'auto', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}} />
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          <div style={itemStyles}>
            <span style={labelStyles}>{t.conclusion}:</span>
            <span style={conclusionValueStyles}>{fields.Conclusion || 'N/A'}</span>
          </div>
          <div style={itemStyles}>
            <span style={labelStyles}>{t.weight}:</span>
            <span style={valueStyles}>{fields.Weight || 'N/A'}</span>
          </div>
          <div style={itemStyles}>
            <span style={labelStyles}>{t.shapeCut}:</span>
            <span style={valueStyles}>{fields.Shape_Cut || 'N/A'}</span>
          </div>
          
          {fields['Comment1'] && (
            <div style={{paddingTop: '1rem'}}>
              <span style={{fontWeight: '600', ...activeTheme.label}}>{t.comment}:</span>
              {/* ★★★ 修正点: コメントの背景をなくし、スタイルを調整 ★★★ */}
              <p style={{marginTop: '0.5rem', lineHeight: '1.6', ...activeTheme.value}}>{fields['Comment1']}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
