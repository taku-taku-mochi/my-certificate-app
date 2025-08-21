// 'use client' を先頭に記述し、ブラウザで動作するコンポーネントであることを明示します。
'use client';

import { useState, useEffect } from 'react';

// --- 翻訳データ ---
const translations = {
  ja: {
    title: '宝石鑑別書',
    certNo: '証書No',
    conclusion: '鑑別結果',
    weight: '重量',
    shapeCut: '形状',
    size: 'サイズ',
    color: '色',
    comment: 'コメント',
    comment3: 'コメント3',
    sideStone: '脇石',
    errorTitle: 'エラー',
    errorNotFound: '鑑定書が見つかりません。IDまたはQRコードが正しいかご確認ください。',
    errorFetch: 'データの取得中にエラーが発生しました。しばらくしてからもう一度お試しください。',
    loading: '読み込み中...'
  },
  en: {
    title: 'Gem Certificate',
    certNo: 'Certificate No',
    conclusion: 'Conclusion',
    weight: 'Weight (ct)',
    shapeCut: 'Shape & Cut',
    size: 'Size (mm)',
    color: 'Color',
    comment: 'Comment',
    comment3: 'Comment 3',
    sideStone: 'Side Stone',
    errorTitle: 'Error',
    errorNotFound: 'Certificate not found. Please check the ID or QR code.',
    errorFetch: 'An error occurred while fetching data. Please try again later.',
    loading: 'Loading...'
  },
  zh: {
    title: '宝石证书',
    certNo: '证书编号',
    conclusion: '结论',
    weight: '克重 (ct)',
    shapeCut: '形状与切工',
    size: '尺寸 (mm)',
    color: '颜色',
    comment: '评论',
    comment3: '评论3',
    sideStone: '副石',
    errorTitle: '错误',
    errorNotFound: '未找到证书。请检查ID或二维码。',
    errorFetch: '获取数据时发生错误。请稍后再试。',
    loading: '加载中...'
  }
};

// --- 各デザインテーマのスタイル定義 ---
const SERIF_FONT = "'Georgia', 'Times New Roman', serif";
const SANS_SERIF_FONT = "'Helvetica Neue', Arial, sans-serif";

// A案: ミニマリスト＆ラグジュアリー
const themeAStyles = {
  page: { backgroundColor: '#121212' },
  card: { backgroundColor: '#1e1e1e', border: '1px solid #444', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 255, 255, 0.07)', padding: '3rem', maxWidth: '640px', fontFamily: SERIF_FONT },
  title: { color: '#e0e0e0', fontWeight: '300', letterSpacing: '0.15em', fontSize: '1.5rem' },
  id: { color: '#888' },
  label: { color: '#999' },
  value: { color: '#f5f5f5' },
  conclusionValue: { color: '#ffffff', fontSize: '1.5rem', fontWeight: '500' },
  divider: { borderColor: '#444' },
  imageShadow: { boxShadow: '5px 5px 20px rgba(255, 255, 255, 0.15)' }
};

// B案：クラシック＆オーセンティック
const themeBStyles = {
  page: { backgroundColor: '#fdfaee' },
  card: { backgroundColor: '#ffffff', border: '8px double #c0a080', padding: '3rem', maxWidth: '560px', fontFamily: SERIF_FONT },
  title: { color: '#5d4037', fontSize: '2rem', fontWeight: '600' },
  id: { color: '#795548' },
  label: { color: '#795548' },
  value: { color: '#3e2723' },
  conclusionValue: { color: '#5d4037', fontSize: '1.5rem' },
  divider: { borderColor: '#d7ccc8' },
  imageShadow: { boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.15)' }
};

// C案：(旧デフォルト)
const themeCStyles = {
  page: { backgroundColor: '#f1f5f9' },
  card: { backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', maxWidth: '560px', fontFamily: SANS_SERIF_FONT },
  title: { color: '#1f2937', fontSize: '1.5rem', fontWeight: 'bold' },
  id: { color: '#6b7280' },
  label: { color: '#4b5563' },
  value: { color: '#1f2937' },
  conclusionValue: { color: '#1f2937', fontSize: '1.2rem' },
  divider: { borderColor: '#e5e7eb' },
  imageShadow: { boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.15)' }
};

// D案: AIGS風デザイン (新デフォルト)
const themeDStyles = {
  page: { backgroundColor: '#f0f2f5' },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e8e8e8',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    maxWidth: '960px',
    fontFamily: SANS_SERIF_FONT,
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkOuter: { // ★★★ 透かし（外側） ★★★
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '20rem',
    color: 'rgba(0, 51, 102, 0.02)',
    zIndex: '1',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  watermarkInner: { // ★★★ 透かし（内側） ★★★
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '18rem',
    color: 'rgba(0, 51, 102, 0.03)',
    zIndex: '1',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    position: 'relative',
    zIndex: '2',
  },
  title: {
    color: '#1f2937',
    fontSize: '1.2rem',
    fontWeight: '600',
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
  },
  certNoHeader: {
    textAlign: 'right',
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  content: {
    position: 'relative',
    zIndex: '2',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3.5rem',
  },
  item: {
    padding: '0.75rem 0',
    borderBottom: '1px solid #f0f0f0',
    textAlign: 'center', // ★★★ テキストを中央揃え ★★★
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  value: {
    fontSize: '1rem',
    color: '#1f2937',
    fontWeight: '500',
  },
  conclusionValue: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#003366',
  },
  imageShadow: {
    boxShadow: '4px 4px 12px rgba(0, 0, 0, 0.15)',
  }
};


// --- 表示担当のコンポーネント ---
export default function CertificateView({ recordId }) {
  const [language, setLanguage] = useState('ja');
  const [certificateData, setCertificateData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState(themeDStyles); // デフォルトをDに

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
        } else if (theme === 'C') {
          setActiveTheme(themeCStyles);
        } else { // Dまたは未選択の場合
          setActiveTheme(themeDStyles);
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
    padding: '1rem',
    transition: 'background-color 0.5s ease',
    ...activeTheme.page,
  };

  const cardStyles = {
    width: '100%',
    borderRadius: '0.5rem',
    padding: '2.5rem',
    transition: 'all 0.5s ease',
    ...activeTheme.card,
  };
  
  const responsiveStyles = `
    @media (max-width: 768px) {
      .aigs-content {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 640px) {
      .certificate-card {
        padding: 1.5rem;
        font-size: 0.9rem;
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
    // ... (エラー表示部分は省略)
  }

  const fields = certificateData.fields;
  const imageUrl = fields.Image && fields.Image.length > 0 ? fields.Image[0].url : 'https://placehold.co/600x400/e2e8f0/a0aec0?text=No+Image';
  
  const imageStyles = {
    width: '100%',
    height: 'auto',
    borderRadius: '0.5rem',
    ...activeTheme.imageShadow,
  };

  // ★★★ テーマDのレンダリング (2列レイアウト) ★★★
  if (activeTheme === themeDStyles) {
    return (
      <main style={pageStyles}>
        <style>{responsiveStyles}</style>
        <div style={cardStyles}>
          <div>
            <div style={activeTheme.watermarkOuter}>◇</div>
            <div style={activeTheme.watermarkInner}>◇</div>
          </div>
          <div style={activeTheme.header}>
            <div style={{flex: 1}}></div>
            <h1 style={activeTheme.title}>{t.title}</h1>
            <div style={{flex: 1, ...activeTheme.certNoHeader}}>
              <span>{t.certNo}: {fields.CNo || 'N/A'}</span>
            </div>
          </div>
          <div style={activeTheme.content} className="aigs-content">
            {/* 左列 */}
            <div>
              <div style={{marginBottom: '1rem'}}>
                <img src={imageUrl} alt={fields.Conclusion || 'Gemstone'} style={imageStyles} />
              </div>
              <div style={activeTheme.item}>
                <span style={activeTheme.label}>{t.conclusion}</span>
                <span style={activeTheme.conclusionValue}>{fields.Conclusion || 'N/A'}</span>
              </div>
              <div style={activeTheme.item}>
                <span style={activeTheme.label}>{t.weight}</span>
                <span style={activeTheme.value}>{fields.Weight || 'N/A'}</span>
              </div>
              {fields.SIdeStone && (
                <div style={activeTheme.item}>
                  <span style={activeTheme.label}>{t.sideStone}</span>
                  <span style={activeTheme.value}>{fields.SIdeStone}</span>
                </div>
              )}
              {fields.Comment3 && (
                <div style={activeTheme.item}>
                  <span style={activeTheme.label}>{t.comment3}</span>
                  <span style={activeTheme.value}>{fields.Comment3}</span>
                </div>
              )}
            </div>
            {/* 右列 */}
            <div>
              <div style={activeTheme.item}>
                <span style={activeTheme.label}>{t.color}</span>
                <span style={activeTheme.value}>{fields.Color || 'N/A'}</span>
              </div>
              <div style={activeTheme.item}>
                <span style={activeTheme.label}>{t.shapeCut}</span>
                <span style={activeTheme.value}>{fields.Shape_Cut || 'N/A'}</span>
              </div>
              <div style={activeTheme.item}>
                <span style={activeTheme.label}>{t.size}</span>
                <span style={activeTheme.value}>{fields.Size || 'N/A'}</span>
              </div>
              {fields.Comment1 && (
                <div style={activeTheme.item}>
                  <span style={activeTheme.label}>{t.comment}</span>
                  <span style={activeTheme.value}>{fields.Comment1}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // --- テーマA, B, C のレンダリング ---
  // ... (省略)
}
