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


// --- 表示担当のコンポーネント ---
export default function CertificateView({ recordId }) {
  const [language, setLanguage] = useState('ja');
  const [certificateData, setCertificateData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCertificateData = async (id, lang) => {
      if (!id) return; // IDがなければ何もしない
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await fetch(`/api/certificate/${id}?lang=${lang}`);
        if (!response.ok) {
          const errorResult = await response.json();
          if (response.status === 404) {
             throw new Error(translations[lang].errorNotFound);
          }
          throw new Error(errorResult.message || translations[lang].errorFetch);
        }
        const data = await response.json();
        setCertificateData(data);
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

  // --- スタイル定義 ---
  const pageStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    padding: '1rem',
  };

  const cardStyles = {
    width: '100%',
    maxWidth: '448px',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: '2.5rem',
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: '1.5rem',
  };
  
  const langButtonContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  };

  const langButtonStyles = (isActive) => ({
    padding: '0.25rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    backgroundColor: isActive ? '#3b82f6' : '#ffffff',
    color: isActive ? '#ffffff' : '#374151',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease-in-out',
  });

  const titleStyles = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
  };

  const idStyles = {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  };
  
  const imageContainerStyles = {
    marginBottom: '1.5rem',
  };

  const imageStyles = {
    width: '100%',
    height: 'auto',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  };

  const detailsContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const itemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0.5rem',
  };
  
  const labelStyles = {
    fontWeight: '600',
    color: '#4b5563',
  };

  const valueStyles = {
    color: '#1f2937',
    fontWeight: '500',
    textAlign: 'right',
  };

  const conclusionValueStyles = {
    ...valueStyles,
    fontSize: '1.2rem',
  };
  
  const commentContainerStyles = {};

  const commentLabelStyles = {
    fontWeight: '600',
    color: '#4b5563',
  };

  const commentTextStyles = {
    backgroundColor: '#f9fafb',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginTop: '0.25rem',
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

  if (loading) {
      return (
          <main style={pageStyles}>
              <div style={cardStyles}>
                <p style={{textAlign: 'center'}}>{t.loading}</p>
              </div>
          </main>
      )
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
        <div style={headerStyles}>
          <h1 style={titleStyles}>{t.title}</h1>
          <p style={idStyles}>- {t.certNo}: {fields.CNo || 'N/A'} -</p>
        </div>

        <div style={imageContainerStyles}>
          <img src={imageUrl} alt={fields.Conclusion || 'Gemstone'} style={imageStyles} />
        </div>

        <div style={detailsContainerStyles}>
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
          
          {fields.Comment && (
            <div style={commentContainerStyles}>
              <span style={commentLabelStyles}>{t.comment}:</span>
              <p style={commentTextStyles}>{fields.Comment}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
