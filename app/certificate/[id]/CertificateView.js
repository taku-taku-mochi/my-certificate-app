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
    shapeCut: '形状',
    size: 'サイズ',
    color: '色',
    comment: 'コメント',
    errorTitle: 'エラー',
    errorNotFound: '鑑定書が見つかりません。IDまたはQRコードが正しいかご確認ください。',
    errorFetch: 'データの取得中にエラーが発生しました。しばらくしてからもう一度お試しください。',
    loading: '読み込み中...'
  },
  en: {
    title: 'Certificate Data',
    certNo: 'Report No',
    conclusion: 'Conclusion',
    weight: 'Weight (ct)',
    shapeCut: 'Shape & Cut',
    size: 'Size (mm)',
    color: 'Color',
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
    weight: '克重 (ct)',
    shapeCut: '形状与切工',
    size: '尺寸 (mm)',
    color: '颜色',
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
    padding: '1rem',
    backgroundColor: '#f1f5f9',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  };

  // カードのスタイル（最初から強調した影）
  const cardStyles = {
    width: '100%',
    borderRadius: '0.5rem',
    padding: '2.5rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 28px 56px -14px rgba(0,0,0,0.40), 0 14px 28px -12px rgba(0,0,0,0.28), 0 3px 10px rgba(0,0,0,0.14)', // ← 強調版を常時適用
    maxWidth: '560px',
    position: 'relative',
    overflow: 'hidden',
  };
  // ウォーターマークのスタイル
  const watermarkOuter = {
    position: 'absolute',
    top: '55%', // ★★★ 位置を調整 ★★★
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '20rem',
    color: 'rgba(0, 51, 102, 0.02)',
    zIndex: '1',
    pointerEvents: 'none',
    userSelect: 'none',
  };
  const watermarkInner = {
    position: 'absolute',
    top: '55%', // ★★★ 位置を調整 ★★★
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '13rem', 
    color: 'rgba(0, 51, 102, 0.03)',
    zIndex: '1',
    pointerEvents: 'none',
    userSelect: 'none',
  };
  // 言語切替ボタンのスタイル
  const langButtonContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  };
  // 言語切替ボタンのスタイル
  const langButtonStyles = (isActive) => ({
    padding: '0.25rem 0.75rem',
    border: `1px solid ${isActive ? '#3b82f6' : '#d1d5db'}`,
    borderRadius: '0.375rem',
    cursor: 'pointer',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? '#ffffff' : '#4b5563',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease-in-out',
  });
  // 汎用アイテムのスタイル
  const itemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: '1rem 0',
    borderBottom: '1px solid #e5e7eb',
  };
  // ラベルのスタイル
  const labelStyles = {
    flexShrink: 0,
    paddingRight: '1.5rem',
    fontWeight: '400',
    color: 'rgba(81, 91, 106, 1)',
  };
  // 値のスタイル
  const valueStyles = {
    textAlign: 'right',
    fontWeight: '500',
    color: 'rgba(36, 46, 60, 1)',
  };
  // 結論の値のスタイル
  const conclusionValueStyles = {
      ...valueStyles,
      fontSize: '1.2rem',
  };
  // エラーメッセージのスタイル
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

  const responsiveStyles = `
    @media (max-width: 640px) {
      .certificate-card {
        padding: 1.2rem;
        font-size: 0.8rem;
      }
      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
      .detail-item-label {
        padding-right: 0;
      }
      .detail-item-value {
        text-align: left;
        overflow-wrap: break-word;
      }
      .header-title {
        font-size: 1.25rem;
      }
    }
  `;

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
  
  const imageStyles = {
    width: '100%',
    height: 'auto',
    borderRadius: '1rem',
    boxShadow: '18px 14px 36px -14px rgba(0,0,0,0.32), 0 14px 28px -12px rgba(0,0,0,0.24), 0 4px 12px rgba(0,0,0,0.12)', // ← 画像も強調を常時
  };
  // 画像のスタイル
  return (
    <main style={pageStyles}>
      <style>{responsiveStyles}</style>
      <div
        style={{ ...cardStyles }} // ← 動的切替を廃止
        className="certificate-card"
        // onMouseEnter={() => setElevated(true)}
        // onMouseLeave={() => setElevated(false)}
      >
        <div>
          <div style={watermarkOuter}>◇</div>
          <div style={watermarkInner}>◇</div>
        </div>
        <div style={{position: 'relative', zIndex: 2}}>
          <div style={langButtonContainerStyles}>
            <button style={langButtonStyles(language === 'ja')} onClick={() => setLanguage('ja')}>日本語</button>
            <button style={langButtonStyles(language === 'en')} onClick={() => setLanguage('en')}>English</button>
            <button style={langButtonStyles(language === 'zh')} onClick={() => setLanguage('zh')}>中文</button>
          </div>
          <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
            <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937'}} className="header-title">{t.title}</h1>
            <p style={{fontSize: '0.875rem', marginTop: '0.25rem', color: '#6b7280'}}>- {t.certNo}: {fields.CNo || 'N/A'} -</p>
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <img
              src={imageUrl}
              alt={fields.Conclusion || 'Gemstone'}
              style={imageStyles} // ← 動的切替を廃止
            />
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            <div style={itemStyles} className="detail-item">
              <span style={labelStyles} className="detail-item-label">{t.conclusion}:</span>
              <span style={conclusionValueStyles} className="detail-item-value">{fields.Conclusion || 'N/A'}</span>
            </div>
            <div style={itemStyles} className="detail-item">
              <span style={labelStyles} className="detail-item-label">{t.color}:</span>
              <span style={valueStyles} className="detail-item-value">{fields.Color || 'N/A'}</span>
            </div>
            <div style={itemStyles} className="detail-item">
              <span style={labelStyles} className="detail-item-label">{t.shapeCut}:</span>
              <span style={valueStyles} className="detail-item-value">{fields.Shape_Cut || 'N/A'}</span>
            </div>
            <div style={itemStyles} className="detail-item">
              <span style={labelStyles} className="detail-item-label">{t.size}:</span>
              <span style={valueStyles} className="detail-item-value">{fields.Size || 'N/A'}</span>
            </div>
            <div style={itemStyles} className="detail-item">
              <span style={labelStyles} className="detail-item-label">{t.weight}:</span>
              <span style={valueStyles} className="detail-item-value">{fields.Weight || 'N/A'}</span>
            </div>
            
            {fields['Comment1'] && (
              <div style={{paddingTop: '1rem'}} className="detail-item">
                <span style={{fontWeight: '600', ...labelStyles}} className="detail-item-label">{t.comment}:</span>
                <p style={{marginTop: '0.5rem', lineHeight: '1.6', ...valueStyles}} className="detail-item-value">{fields['Comment1']}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
