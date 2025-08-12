// このスクリプトは、ローカルファイルを一度imgbbにアップロードし、その公開URLを使ってAirtableを更新します。

const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// --- 設定項目 ---
// 画像が保存されているローカルフォルダのパスを指定してください
const IMAGE_FOLDER_PATH = 'C:\\IMG'; 

// --- 接続情報 ---
const airtableBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const airtableTableName = process.env.AIRTABLE_TABLE_ID;
const imgbbApiKey = process.env.IMGBB_API_KEY;


// --- 画像をimgbbにアップロードし、URLを返す関数 ---
async function uploadToImgbb(imagePath) {
  try {
    const image = fs.readFileSync(imagePath);
    const form = new FormData();
    form.append('image', image, { filename: path.basename(imagePath) });

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, form, {
      headers: form.getHeaders(),
    });

    if (response.data && response.data.success) {
      return response.data.data.url; // アップロードされた画像のURLを返す
    } else {
      console.error('imgbbへのアップロードに失敗しました:', response.data);
      return null;
    }
  } catch (error) {
    console.error('imgbbへのアップロード中にエラーが発生しました:', error.response ? error.response.data : error.message);
    return null;
  }
}


// --- メインの処理 ---
async function processUploads() {
  console.log('--- 画像アップロード処理を開始します ---');
  if (!imgbbApiKey) {
    console.error('エラー: .env.localファイルにIMGBB_API_KEYが設定されていません。');
    return;
  }

  try {
    // 1. Airtableから画像がまだないレコードを取得
    console.log('Airtableからレコードを取得中...');
    const records = await airtableBase(airtableTableName).select({
      filterByFormula: "NOT({Image})"
    }).all();

    console.log(`${records.length}件の画像未設定レコードが見つかりました。`);
    if (records.length === 0) {
      console.log('すべてのレコードに画像が設定されています。処理を終了します。');
      return;
    }

    // 2. 各レコードに対して処理を実行
    for (const record of records) {
      const fullCno = record.get('CNo');
      if (!fullCno) {
        console.log(`- レコードID ${record.id} にはCNoがありません。スキップします。`);
        continue;
      }

      // ★★★ 更新されたロジック: CNoから検索用の部分を抽出 ★★★
      // 先頭のアルファベットとそれに続く数字の部分を抽出します。
      const searchCnoMatch = fullCno.match(/^[A-Za-z]+[0-9]+/);
      if (!searchCnoMatch) {
          console.log(`- CNo「${fullCno}」から検索用IDを抽出できませんでした。`);
          continue;
      }
      const searchCno = searchCnoMatch[0]; // 例: "ET1641D-..." -> "ET1641"

      console.log(`- CNo「${fullCno}」から検索用ID「${searchCno}」を抽出しました。`);

      // 3. 指定されたフォルダ内でsearchCnoを含むファイルを探す
      let imagePath = null;
      try {
        const filesInFolder = fs.readdirSync(IMAGE_FOLDER_PATH);
        // 抽出したsearchCnoを使ってファイルを探す
        const foundFile = filesInFolder.find(file => file.includes(searchCno));

        if (foundFile) {
          imagePath = path.join(IMAGE_FOLDER_PATH, foundFile);
        }
      } catch (e) {
        console.error(`フォルダ「${IMAGE_FOLDER_PATH}」の読み込みに失敗しました。パスが正しいか確認してください。`, e);
        // このエラーは致命的なので処理を中断
        return;
      }
      
      // 4. 画像が見つかったら、まずimgbbにアップロード
      if (imagePath) {
        console.log(`- 検索用ID「${searchCno}」の画像「${path.basename(imagePath)}」をimgbbにアップロード中...`);
        const imageUrl = await uploadToImgbb(imagePath);

        // 5. imgbbから取得したURLを使ってAirtableを更新
        if (imageUrl) {
          console.log(`  -> imgbbアップロード成功。URL: ${imageUrl}`);
          console.log(`  -> Airtableを更新しています...`);
          try {
            await airtableBase(airtableTableName).update(record.id, {
              "Image": [{ "url": imageUrl }]
            });
            console.log(`  -> Airtableの更新成功！`);
          } catch (airtableError) {
            console.error(`  -> Airtableの更新中にエラーが発生しました:`, airtableError.message);
          }
        } else {
          console.log(`  -> imgbbへのアップロードに失敗したため、Airtableは更新されませんでした。`);
        }
      } else {
        console.log(`- 検索用ID「${searchCno}」に対応する画像ファイルがフォルダ「${IMAGE_FOLDER_PATH}」内で見つかりませんでした。`);
      }
    }

  } catch (error) {
    console.error('処理全体でエラーが発生しました:', error);
  }

  console.log('--- すべての処理が完了しました ---');
}

// スクリプトを実行
processUploads();
