import { useState } from "react";

type Props = {
  csvText: string;
  originalFileName: string;
};

function cleanFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}_clean.csv`;
}

export function DownloadButton({ csvText, originalFileName }: Props) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = cleanFileName(originalFileName);
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(csvText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = csvText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card download-card">
      <h2 className="card-title">ダウンロード</h2>
      <p className="download-desc">
        クリーニング済みの UTF-8（BOMなし）CSV ファイルを出力します。
      </p>
      <div className="download-buttons">
        <button className="btn btn-primary" onClick={handleDownload}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          CSVをダウンロード
        </button>
        <button className="btn btn-secondary" onClick={handleCopy}>
          {copied ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              コピー完了！
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              テキストをコピー
            </>
          )}
        </button>
      </div>
    </div>
  );
}
