# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ブラウザ完結型の CSV クリーニング・WebGIS 変換ツール。
React 19 + TypeScript + Vite 8 で構築。サーバーサイド処理なし（全処理クライアント側）。
GeoJSON / CZML / KML へのエクスポートに対応。
デプロイ先: Cloudflare Pages（`public/_headers` / `public/_redirects` で設定）。

## 開発コマンド

```bash
npm run dev      # 開発サーバー (HMR)
npm run build    # tsc -b && vite build（型チェック込み）
npm run lint     # ESLint
npm run preview  # dist/ のプレビュー
```

テストフレームワークは未導入。`npm run build` が型チェックを兼ねるため、変更後は `npm run build` で型エラーがないことを確認する。

## アーキテクチャ

### 処理パイプライン (`src/App.tsx` の `runPipeline`)

ファイル読み込みはすべて `FileReader` → `ArrayBuffer` で行い、以下の関数を順番に呼び出す純粋関数チェーン。

```
detectEncoding → decodeFile → normalizeText → detectDelimiter
→ parseCsv → normalizeHeaders → normalizeCells → filterEmptyRows
→ validateRows → regenerateCsv
```

- 各 lib 関数は副作用なし（純粋関数）、`src/lib/` に1関数1ファイルで配置
- `ProcessingResult` 型が全ての出力を束ねる
- オプション変更時は同じパイプラインを再実行（バッファをキャッシュ）

### ファイル制限 (`src/App.tsx`)

- `FILE_SIZE_LIMIT = 50 MB`: ハード上限。`handleFile` 内で `buffer.byteLength` を判定し、超過時は `setError` してパイプライン中断
- `FILE_SIZE_WARN = 5 MB`: ソフト警告。`largeFileWarning` state で管理し、バナー表示
- `ROW_LIMIT = 100,000`: `runPipeline` 内で `parseCsv` 直後に `rawRows.length` を判定し、超過時は `throw`

### 主要ライブラリ

- **encoding-japanese**: Shift_JIS / CP932 のエンコーディング検出・デコードに使用（`detectEncoding.ts`, `decodeFile.ts`）
- **papaparse**: CSV パース（`parseCsv.ts` でラップ）

### GeoJSON 変換 (`src/lib/generateGeojson.ts`)

- `generateGeojson(headers, rows, options)` → JSON 文字列
- 座標列は `properties` から除外
- 座標が空または非数値の行は `geometry: null`（行は除外しない）
- 数値文字列は `number` 型に変換して `properties` に格納
- 高さ列はパース成功時のみ座標配列の第3要素として追加
- `markerColor` / `markerSize` を `properties` の `marker-color` / `marker-size` として出力

### CZML 変換 (`src/lib/generateCzml.ts`)

- `generateCzml(headers, rows, options)` → JSON 文字列
- 先頭に `id: "document"` パケットを挿入
- 高さ未指定時は 0 m（Cesium の地表）として出力
- `pointColor` は `#RRGGBB` → RGBA (0〜1 float) 配列に変換

### KML 変換 (`src/lib/generateKml.ts`)

- `generateKml(headers, rows, options)` → XML 文字列
- `iconColor` は `#RRGGBB` → KML の `AABBGGRR` 形式に変換
- 高さ列が空の場合は座標を `lng,lat` のみ（2D）で出力

### エクスポートパネル共通

- `key={fileLoadCount}` でファイルロードのたびにアンマウント → ドロップダウンをリセット
- 経度・緯度が未選択の場合はダウンロードボタンを `disabled`
- CSS クラスは `.export-*` 系を共有（`GeoJSONPanel` / `CZMLPanel` / `KMLPanel` 共通）

## 型定義 (`src/types/csv.ts`)

重要な型:

| 型 | 用途 |
|----|------|
| `ProcessingResult` | パイプライン全体の出力 |
| `CleaningOption` | ユーザーが設定できるクリーニングオプション |
| `CleaningAction` | クリーニングで実施された操作（レポート表示用） |
| `ValidationWarning` | バリデーション警告 |
| `GeoJSONExportOptions` | GeoJSON 変換時の列指定・スタイルオプション |
| `CZMLExportOptions` | CZML 変換時の列指定・スタイルオプション |
| `KMLExportOptions` | KML 変換時の列指定・スタイルオプション |

## スタイル

- Plain CSS のみ（`src/styles/app.css`）、フレームワーク不使用
- CSS カスタムプロパティで色・角丸・シャドウを一元管理（`:root` に定義）
- カード系コンポーネントは `.card` ベースクラス＋修飾クラスで色分け
  - `.download-card`: 青 / `.geojson-card`: 緑 / `.czml-card`: 紫 / `.kml-card`: オレンジ
- エクスポートパネルのセレクタ類は `.export-*` 系クラスに統一（旧 `.geojson-*` から移行済み）

## 注意事項

- `src/assets/` に残っている `react.svg` / `vite.svg` / `hero.png` は未使用
- `src/App.css` と `src/index.css` は Vite テンプレートの残骸（未使用）
