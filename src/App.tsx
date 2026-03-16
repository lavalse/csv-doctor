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
import { ErrorNotice } from "./components/ErrorNotice";
import "./styles/app.css";

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

  const handleFile = (file: File) => {
    setFileLoadCount((c) => c + 1);
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const enc = detectEncoding(buffer);
      setRawBuffer(buffer);
      setCachedEncoding(enc);
      setCachedFileName(file.name);
      setFileSize(file.size);
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
        <h1 className="hero-title">CSV Doctor</h1>
        <p className="hero-subtitle">
          Shift_JIS / CP932 / UTF-8 CSVファイルを自動クリーニングして<br />
          文字化けなしのUTF-8 CSVに変換します
        </p>
      </header>

      <main className="main">
        <FileDropzone onFileSelected={handleFile} />

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
          </>
        )}
      </main>

      <footer className="footer">
        <p>すべての処理はブラウザ内で完結します。ファイルはサーバーに送信されません。</p>
      </footer>
    </div>
  );
}
