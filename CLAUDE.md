# CLAUDE.md — csv-doctor

## プロジェクト概要

ブラウザ完結型の CSV クリーニング・GeoJSON 変換ツール。
React 19 + TypeScript + Vite 8 で構築。サーバーサイド処理なし。

---

## 開発コマンド

```bash
npm run dev      # 開発サーバー (HMR)
npm run build    # tsc -b && vite build（型チェック込み）
npm run lint     # ESLint
npm run preview  # dist/ のプレビュー
```

---

## アーキテクチャ

### 処理パイプライン (`src/App.tsx` の `runPipeline`)

ファイル読み込みはすべて `FileReader` → `ArrayBuffer` で行い、以下の関数を順番に呼び出す純粋関数チェーン。

```
detectEncoding → decodeFile → normalizeText → detectDelimiter
→ parseCsv → normalizeHeaders → normalizeCells → filterEmptyRows
→ validateRows → regenerateCsv
```

- 各 lib 関数は副作用なし（純粋関数）
- `ProcessingResult` 型が全ての出力を束ねる
- オプション変更時は同じパイプラインを再実行（バッファをキャッシュ）

### GeoJSON 変換 (`src/lib/generateGeojson.ts`)

- `generateGeojson(headers, rows, options)` → JSON 文字列
- 座標列は `properties` から除外
- 座標が空または非数値の行は `geometry: null`（行は除外しない）
- 数値文字列は `number` 型に変換して `properties` に格納
- 高さ列はパース成功時のみ座標配列の第3要素として追加

### GeoJSON UI (`src/components/GeoJSONPanel.tsx`)

- `key={fileLoadCount}` でファイルロードのたびにアンマウント → ドロップダウンをリセット
- 経度・緯度が未選択の場合はダウンロードボタンを `disabled`

---

## 型定義 (`src/types/csv.ts`)

重要な型:

| 型 | 用途 |
|----|------|
| `ProcessingResult` | パイプライン全体の出力 |
| `CleaningOption` | ユーザーが設定できるクリーニングオプション |
| `CleaningAction` | クリーニングで実施された操作（レポート表示用） |
| `ValidationWarning` | バリデーション警告 |
| `GeoJSONExportOptions` | GeoJSON 変換時の列指定オプション |

---

## スタイル

- Plain CSS のみ（`src/styles/app.css`）、フレームワーク不使用
- CSS カスタムプロパティで色・角丸・シャドウを一元管理（`:root` に定義）
- カード系コンポーネントは `.card` ベースクラス＋修飾クラスで色分け
  - `.download-card`: 青グラデーション
  - `.geojson-card`: 緑グラデーション

---

## 注意事項

- `src/assets/` に残っている `react.svg` / `vite.svg` / `hero.png` は未使用
- `src/App.css` と `src/index.css` は Vite テンプレートの残骸（未使用）
- `public/_headers` / `public/_redirects` は Cloudflare Pages 向けの設定ファイル
