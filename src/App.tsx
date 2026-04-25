import { useState } from "react";
import type { CleaningOption, DetectedEncoding, ProcessingResult } from "./types/csv";
import { detectEncoding } from "./lib/detectEncoding";
import { decodeFile } from "./lib/decodeFile";
import { normalizeText } from "./lib/normalizeText";
import { detectDelimiter } from "./lib/detectDelimiter";
import { parseCsv } from "./lib/parseCsv";
import { normalizeHeaders } from "./lib/normalizeHeaders";
import { normalizeCells } from "./lib/normalizeCells";
import { filterEmptyRows } from "./lib/filterEmptyRows";
import { validateRows } from "./lib/validateRows";
import { regenerateCsv } from "./lib/regenerateCsv";
import { FileDropzone } from "./components/FileDropzone";
import { FileSummary } from "./components/FileSummary";
import { OptionsPanel } from "./components/OptionsPanel";
import { CleaningReport } from "./components/CleaningReport";
import { PreviewTable } from "./components/PreviewTable";
import { DownloadButton } from "./components/DownloadButton";
import { GeoJSONPanel } from "./components/GeoJSONPanel";
import { CZMLPanel } from "./components/CZMLPanel";
import { KMLPanel } from "./components/KMLPanel";
import { ErrorNotice } from "./components/ErrorNotice";
import "./styles/app.css";

const FILE_SIZE_LIMIT = 50 * 1024 * 1024;  // 50 MB: hard limit
const FILE_SIZE_WARN  =  5 * 1024 * 1024;  // 5 MB: soft warning
const ROW_LIMIT = 100_000;

const DEFAULT_OPTIONS: CleaningOption = {
  normalizeNFKC: true,
  removeInvisibleChars: true,
  trimHeaders: true,
  trimCells: true,
  normalizeMultilineCells: true,
  removeEmptyRows: true,
  forceCommaDelimiter: false,
};

function runPipeline(
  buffer: ArrayBuffer,
  encoding: DetectedEncoding,
  options: CleaningOption,
  fileName: string
): ProcessingResult {
  const rawText = decodeFile(buffer, encoding);
  const { text, actions: textActions } = normalizeText(rawText, options);
  const delimiter = detectDelimiter(text);
  const { data, errors: parseErrors } = parseCsv(text, delimiter);

  if (data.length === 0) {
    throw new Error("ファイルが空か、解析できませんでした。");
  }

  const rawHeaders = data[0];
  const rawRows = data.slice(1);

  if (rawRows.length > ROW_LIMIT) {
    throw new Error(`行数が上限（100,000 行）を超えています（${rawRows.length.toLocaleString()} 行）。`);
  }

  const { headers, actions: headerActions, warnings: headerWarnings } = normalizeHeaders(rawHeaders, options);
  const { rows: normalizedRows, actions: cellActions } = normalizeCells(rawRows, options);
  const { rows: filteredRows, actions: filterActions } = filterEmptyRows(normalizedRows, options);
  const rowWarnings = validateRows(headers, filteredRows, parseErrors);
  const cleanCsvText = regenerateCsv(headers, filteredRows, delimiter, options.forceCommaDelimiter);

  return {
    encoding,
    delimiter,
    parsed: { headers, rows: filteredRows },
    actions: [...textActions, ...headerActions, ...cellActions, ...filterActions],
    warnings: [...headerWarnings, ...rowWarnings],
    cleanCsvText,
    originalFileName: fileName,
  };
}

export default function App() {
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileLoadCount, setFileLoadCount] = useState<number>(0);
  const [rawBuffer, setRawBuffer] = useState<ArrayBuffer | null>(null);
  const [cachedEncoding, setCachedEncoding] = useState<DetectedEncoding | null>(null);
  const [cachedFileName, setCachedFileName] = useState<string>("");
  const [options, setOptions] = useState<CleaningOption>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [largeFileWarning, setLargeFileWarning] = useState<boolean>(false);

  const handleFile = (file: File) => {
    setFileLoadCount((c) => c + 1);
    setError(null);
    setResult(null);
    setLargeFileWarning(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer.byteLength > FILE_SIZE_LIMIT) {
        setError(`ファイルサイズが上限（50 MB）を超えています（${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB）。`);
        return;
      }
      const enc = detectEncoding(buffer);
      setRawBuffer(buffer);
      setCachedEncoding(enc);
      setCachedFileName(file.name);
      setFileSize(file.size);
      setLargeFileWarning(buffer.byteLength > FILE_SIZE_WARN);
      try {
        setResult(runPipeline(buffer, enc, options, file.name));
      } catch (err) {
        setError(err instanceof Error ? err.message : "予期しないエラーが発生しました。");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleOptionChange = (newOptions: CleaningOption) => {
    setOptions(newOptions);
    if (rawBuffer && cachedEncoding && cachedFileName) {
      setError(null);
      try {
        setResult(runPipeline(rawBuffer, cachedEncoding, newOptions, cachedFileName));
      } catch (err) {
        setError(err instanceof Error ? err.message : "予期しないエラーが発生しました。");
      }
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <a
          className="hero-github"
          href="https://github.com/lavalse/csv-doctor"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
        >
          <svg width="24" height="24" aria-hidden="true">
            <use href="/icons.svg#github-icon" />
          </svg>
        </a>
        <img src="/csv-doctor-pix.png" alt="" className="hero-logo" />
        <h1 className="hero-title">CSV Doctor</h1>
        <p className="hero-subtitle">
          CSV のお悩み、まるごと解決。WebGIS 向けフォーマットへの変換もブラウザ完結で。
        </p>
      </header>

      <main className="main">
        <section className="intro-section">
          <p className="intro-lead">
            各種 CSV 形式に振り回されて、頭を抱えた経験はありませんか？
          </p>
          <p className="intro-body">
            そもそも CSV は WebGIS のために設計されたフォーマットではありません。
            文字コードの混在、区切り文字の揺れ、全角スペースや見えない制御文字——
            地図に載せようとするたびに何かしらの問題が起きるのは、ある意味当然です。
          </p>
          <p className="intro-body">
            <strong>CSV Doctor</strong> はそんな CSV を自動でクリーニングし、
            すぐに使える UTF-8 CSV として書き出します。
            さらに、WebGIS で広く推奨される <strong>GeoJSON・CZML・KML</strong>
            への変換もワンクリックで行えます。
            ファイルはブラウザ内だけで処理されるため、サーバーに送信されることはありません。
          </p>
          <ul className="intro-features">
            <li>
              <span className="feature-icon">🔤</span>
              <span>Shift_JIS / CP932 / UTF-8 を自動判別してクリーニング</span>
            </li>
            <li>
              <span className="feature-icon">🗺️</span>
              <span>座標列を指定するだけで GeoJSON / CZML / KML に変換</span>
            </li>
            <li>
              <span className="feature-icon">🔒</span>
              <span>完全オフライン処理——データは外部に出ない</span>
            </li>
          </ul>
        </section>

        <FileDropzone onFileSelected={handleFile} />

        {largeFileWarning && (
          <div className="warning-notice">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
            </svg>
            <span>ファイルサイズが 5 MB を超えています。処理に時間がかかる場合があります。</span>
          </div>
        )}
        {error && <ErrorNotice message={error} />}

        {result && (
          <>
            <FileSummary
              fileName={result.originalFileName}
              fileSize={fileSize}
              encoding={result.encoding}
              delimiter={result.delimiter}
              rowCount={result.parsed.rows.length}
              columnCount={result.parsed.headers.length}
            />
            <OptionsPanel options={options} onChange={handleOptionChange} />
            <CleaningReport actions={result.actions} warnings={result.warnings} />
            <PreviewTable headers={result.parsed.headers} rows={result.parsed.rows} />
            <DownloadButton csvText={result.cleanCsvText} originalFileName={result.originalFileName} />
            <GeoJSONPanel
              key={fileLoadCount}
              headers={result.parsed.headers}
              rows={result.parsed.rows}
              originalFileName={result.originalFileName}
            />
            <CZMLPanel
              key={`czml-${fileLoadCount}`}
              headers={result.parsed.headers}
              rows={result.parsed.rows}
              originalFileName={result.originalFileName}
            />
            <KMLPanel
              key={`kml-${fileLoadCount}`}
              headers={result.parsed.headers}
              rows={result.parsed.rows}
              originalFileName={result.originalFileName}
            />
          </>
        )}
      </main>

      <footer className="footer">
        <p>すべての処理はブラウザ内で完結します。ファイルはサーバーに送信されません。</p>
        <p>ファイルサイズ上限：50 MB　／　行数上限：100,000 行</p>
        <p className="footer-version">v{__APP_VERSION__}</p>
      </footer>
    </div>
  );
}
