// このスクリプトは、PC上で直接実行して、ローカルの画像ファイルをAirtableに自動でアップロードします。

// 必要な部品をインポートします
const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') }); // .env.localのパスを正しく解決

// --- 設定項目 ---
// 画像が保存されている大元のローカルフォルダのパスを指定してください
const IMAGE_FOLDER_PATH = 'G:\\写真Backup'; 

// Airtableの接続情報を環境変数から取得
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_ID;

// --- メインの処理 ---
async function uploadImages() {
  console.log('--- 画像アップロード処理を開始します ---');
  console.log(`検索対象のルートフォルダ: ${IMAGE_FOLDER_PATH}`);

  try {
    // 1. Airtableから画像がまだないレコードを取得
    console.log('Airtableからレコードを取得中...');
    const records = await base(tableName).select({
      filterByFormula: "NOT({Image})"
    }).all();

    console.log(`${records.length}件の画像未設定レコードが見つかりました。`);
    if (records.length === 0) {
      console.log('すべてのレコードに画像が設定されています。処理を終了します。');
      return;
    }

    // 2. 各レコードに対して処理を実行
    for (const record of records) {
      const cno = record.get('CNo');
      if (!cno) {
        console.log(`- レコードID ${record.id} にはCNoがありません。スキップします。`);
        continue;
      }

      // 3. CNoからフォルダ名プレフィックス（アルファベット部分）を抽出
      const folderPrefixMatch = cno.match(/^[A-Za-z]{2,3}/);
      if (!folderPrefixMatch) {
        console.log(`- CNo「${cno}」からフォルダ名のプレフィックスを特定できませんでした。`);
        continue;
      }
      const folderPrefix = folderPrefixMatch[0];

      // 4. ルートフォルダ内でプレフィックスに一致するサブフォルダを探す
      let subfolderPath = null;
      try {
        const allDirs = fs.readdirSync(IMAGE_FOLDER_PATH, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name);
        
        const foundDir = allDirs.find(dirName => dirName.toUpperCase() === folderPrefix.toUpperCase());
        
        if (foundDir) {
          subfolderPath = path.join(IMAGE_FOLDER_PATH, foundDir);
        }
      } catch (e) {
        console.error(`ルートフォルダ「${IMAGE_FOLDER_PATH}」の読み込みに失敗しました。パスが正しいか確認してください。`, e);
        return; // ルートフォルダがない場合は処理を中断
      }

      if (!subfolderPath) {
        console.log(`- CNo「${cno}」に対応するサブフォルダ「${folderPrefix}」が見つかりませんでした。`);
        continue;
      }

      // 5. サブフォルダ内でCNoを含むファイルを探す
      let imagePath = null;
      try {
        const filesInSubfolder = fs.readdirSync(subfolderPath);
        const foundFile = filesInSubfolder.find(file => file.includes(cno));

        if (foundFile) {
          imagePath = path.join(subfolderPath, foundFile);
        }
      } catch (e) {
        console.error(`サブフォルダ「${subfolderPath}」の読み込みに失敗しました。`, e);
        continue;
      }
      
      // 6. 画像が見つかったら、Airtableにアップロード
      if (imagePath) {
        console.log(`- CNo「${cno}」の画像「${path.basename(imagePath)}」が見つかりました。アップロードしています...`);
        try {
          // ファイルパスのバックスラッシュをスラッシュに変換
          const urlFormattedPath = imagePath.replace(/\\/g, '/');
          await base(tableName).update(record.id, {
            "Image": [
              { "url": `file://${urlFormattedPath}` } 
            ]
          });
          console.log(`  -> アップロード成功！`);
        } catch (uploadError) {
          console.error(`  -> CNo「${cno}」のアップロード中にエラーが発生しました:`, uploadError);
        }
      } else {
        console.log(`- CNo「${cno}」に対応する画像ファイルがサブフォルダ「${path.basename(subfolderPath)}」内で見つかりませんでした。`);
      }
    }

  } catch (error) {
    console.error('処理全体でエラーが発生しました:', error);
  }

  console.log('--- すべての処理が完了しました ---');
}

// スクリプトを実行
uploadImages();
