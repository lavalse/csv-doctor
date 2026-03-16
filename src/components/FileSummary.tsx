import type { DetectedEncoding, Delimiter } from "../types/csv";

type Props = {
  fileName: string;
  fileSize: number;
  encoding: DetectedEncoding;
  delimiter: Delimiter;
  rowCount: number;
  columnCount: number;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function delimiterLabel(d: Delimiter): string {
  if (d === ",") return "カンマ (,)";
  if (d === "\t") return "タブ (\\t)";
  return "セミコロン (;)";
}

function encodingLabel(e: DetectedEncoding): string {
  const map: Record<DetectedEncoding, string> = {
    "utf-8": "UTF-8",
    "utf-8-bom": "UTF-8 (BOM付き)",
    "shift_jis": "Shift_JIS",
    "cp932": "CP932 (Windows-31J)",
    "unknown": "不明",
  };
  return map[e];
}

export function FileSummary({ fileName, fileSize, encoding, delimiter, rowCount, columnCount }: Props) {
  return (
    <div className="card">
      <h2 className="card-title">ファイル情報</h2>
      <dl className="summary-grid">
        <dt>ファイル名</dt>
        <dd title={fileName}>{fileName}</dd>
        <dt>サイズ</dt>
        <dd>{formatSize(fileSize)}</dd>
        <dt>文字コード</dt>
        <dd>{encodingLabel(encoding)}</dd>
        <dt>区切り文字</dt>
        <dd>{delimiterLabel(delimiter)}</dd>
        <dt>データ行数</dt>
        <dd>{rowCount.toLocaleString()} 行</dd>
        <dt>列数</dt>
        <dd>{columnCount} 列</dd>
      </dl>
    </div>
  );
}
