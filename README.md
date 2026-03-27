# CSV Doctor

<p align="center">
  <img src="public/csv_doctor.png" alt="CSV Doctor" width="160" />
</p>

ブラウザで完結する CSV クリーニング・WebGIS 変換ツールです。Shift_JIS / CP932 / UTF-8 の CSV ファイルを読み込み、自動クリーニングを施したうえで文字化けのない UTF-8 CSV としてダウンロードできます。座標列がある場合は **GeoJSON / CZML / KML** への変換・エクスポートにも対応しています。

**すべての処理はブラウザ内で完結します。ファイルはサーバーに送信されません。**

---

## 主な機能

### CSV クリーニング
| 機能 | 説明 |
|------|------|
| エンコーディング自動検出 | Shift_JIS / CP932 / UTF-8 (BOM あり・なし) を自動判別 |
| 区切り文字自動検出 | カンマ / セミコロン / タブを自動判別 |
| Unicode 正規化 (NFKC) | 全角英数字・記号を半角に統一 |
| 不可視文字除去 | ゼロ幅スペースなどの制御文字を削除 |
| ヘッダー・セルのトリム | 前後の空白を除去 |
| 複数行セルの正規化 | セル内改行を統一 |
| 空行除去 | データのない行を削除 |
| 重複・空ヘッダーの補完 | 重複ヘッダーに連番付与、空ヘッダーを自動命名 |

### ファイル制限
| 項目 | 上限 |
|------|------|
| ファイルサイズ | 50 MB（超過時はエラー、5 MB 超で警告表示） |
| 行数 | 100,000 行 |

### 座標列の自動検出
- CSV ヘッダーから経度・緯度列を自動推定し、エクスポートパネルのドロップダウンに初期選択
- 英語（`longitude`, `lat`, `lng` 等）、中国語（`经度`, `纬度`）、日本語（`経度`, `緯度`）に対応
- 検出できない場合はユーザーが手動で選択

### GeoJSON エクスポート
- 経度・緯度列（必須）と高さ列（任意）を UI から選択
- 選択した座標列を `Point` ジオメトリとして出力
- 座標が無効な行は `geometry: null` で出力（行は除外されない）
- 座標列以外のカラムは `properties` に自動格納（数値文字列は `number` 型に変換）
- マーカー色・サイズを UI から指定して `marker-color` / `marker-size` プロパティに出力
- 出力形式: `GeoJSON FeatureCollection`（`application/geo+json`）

### CZML エクスポート
- 経度・緯度・高さ列、名前列、ポイント色・サイズを指定
- 高さ未指定時は 0 m として出力
- Cesium / Re:Earth など CZML 対応ビューアで直接利用可能
- 出力形式: `CZML`（`application/json`）

### KML エクスポート
- 経度・緯度・高さ列、名前列、説明列、アイコン色・スケールを指定
- アイコン色は `#RRGGBB` → KML の `AABBGGRR` 形式に自動変換
- Google Earth / QGIS など KML 対応アプリで直接利用可能
- 出力形式: `KML`（`application/vnd.google-earth.kml+xml`）

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite 8 |
| CSV パース | PapaParse |
| エンコーディング変換 | encoding-japanese |
| スタイル | Plain CSS（フレームワークなし） |

---

## ディレクトリ構成

```
src/
├── App.tsx                     # ルートコンポーネント・処理パイプライン
├── types/
│   └── csv.ts                  # 型定義 (ProcessingResult, GeoJSONExportOptions など)
├── lib/
│   ├── detectEncoding.ts       # エンコーディング検出
│   ├── decodeFile.ts           # ArrayBuffer → 文字列デコード
│   ├── normalizeText.ts        # テキストレベルの正規化
│   ├── detectDelimiter.ts      # 区切り文字推定
│   ├── parseCsv.ts             # CSV パース (PapaParse ラッパー)
│   ├── normalizeHeaders.ts     # ヘッダー正規化・重複補完
│   ├── normalizeCells.ts       # セル正規化
│   ├── filterEmptyRows.ts      # 空行フィルタ
│   ├── validateRows.ts         # バリデーション・警告生成
│   ├── regenerateCsv.ts        # クリーン CSV 再生成
│   ├── generateGeojson.ts      # GeoJSON 変換・出力
│   ├── generateCzml.ts         # CZML 変換・出力
│   └── generateKml.ts          # KML 変換・出力
└── components/
    ├── FileDropzone.tsx         # ファイルドロップ・選択 UI
    ├── FileSummary.tsx          # ファイル情報サマリー
    ├── OptionsPanel.tsx         # クリーニングオプション UI
    ├── CleaningReport.tsx       # 処理結果・警告レポート
    ├── PreviewTable.tsx         # データプレビューテーブル
    ├── DownloadButton.tsx       # CSV ダウンロードボタン
    ├── GeoJSONPanel.tsx         # GeoJSON エクスポート UI
    ├── CZMLPanel.tsx            # CZML エクスポート UI
    ├── KMLPanel.tsx             # KML エクスポート UI
    └── ErrorNotice.tsx          # エラー表示
```

---

## 開発

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## 処理の流れ

```
File (Shift_JIS / UTF-8)
  └─ detectEncoding       → エンコーディング判別
  └─ decodeFile           → UTF-16 文字列に変換
  └─ normalizeText        → BOM 除去 / 改行統一 / NFKC / 不可視文字除去
  └─ detectDelimiter      → 区切り文字推定
  └─ parseCsv             → rows: string[][]
  └─ normalizeHeaders     → 重複・空ヘッダー補完
  └─ normalizeCells       → トリム / 複数行正規化
  └─ filterEmptyRows      → 空行除去
  └─ validateRows         → 警告リスト生成
  └─ regenerateCsv        → クリーン UTF-8 CSV テキスト
                          → (任意) generateGeojson → GeoJSON FeatureCollection
                          → (任意) generateCzml    → CZML
                          → (任意) generateKml     → KML
```
