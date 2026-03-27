import { useEffect, useState } from "react";
import type { CZMLExportOptions } from "../types/csv";
import { generateCzml, czmlFileName } from "../lib/generateCzml";
import { detectCoordinateColumns } from "../lib/detectCoordinateColumns";

type Props = { headers: string[]; rows: string[][]; originalFileName: string };

export function CZMLPanel({ headers, rows, originalFileName }: Props) {
  const detected = detectCoordinateColumns(headers);
  const [lngCol, setLngCol] = useState(detected.lngCol);
  const [latCol, setLatCol] = useState(detected.latCol);
  const [heightCol, setHeightCol] = useState("");
  const [nameCol, setNameCol] = useState("");
  const [pointColor, setPointColor] = useState("#ffff00");
  const [pixelSize, setPixelSize] = useState(8);

  useEffect(() => {
    const d = detectCoordinateColumns(headers);
    setLngCol(d.lngCol);
    setLatCol(d.latCol);
    setHeightCol("");
    setNameCol("");
  }, [headers]);

  const canExport = lngCol !== "" && latCol !== "";

  const handleDownload = () => {
    if (!canExport) return;
    const options: CZMLExportOptions = { lngColumn: lngCol, latColumn: latCol, heightColumn: heightCol, nameColumn: nameCol, pointColor, pixelSize };
    const text = generateCzml(headers, rows, options);
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = czmlFileName(originalFileName);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card czml-card">
      <h2 className="card-title">CZMLエクスポート</h2>
      <p className="download-desc">
        Cesium.js 向けの CZML 形式で出力します。座標が無効な行は
        <code>position</code> なしのパケットとして出力されます。
        高さ列が未選択または無効な場合は高さ <code>0</code> になります。
      </p>
      <div className="export-selectors">
        <div className="export-selector-row">
          <label className="export-label" htmlFor="czml-lng">経度列<span className="export-required">（必須）</span></label>
          <select id="czml-lng" className="export-select" value={lngCol} onChange={e => setLngCol(e.target.value)}>
            <option value="">— 選択してください —</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="export-selector-row">
          <label className="export-label" htmlFor="czml-lat">緯度列<span className="export-required">（必須）</span></label>
          <select id="czml-lat" className="export-select" value={latCol} onChange={e => setLatCol(e.target.value)}>
            <option value="">— 選択してください —</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="export-selector-row">
          <label className="export-label" htmlFor="czml-height">高さ列<span className="export-optional">（任意）</span></label>
          <select id="czml-height" className="export-select" value={heightCol} onChange={e => setHeightCol(e.target.value)}>
            <option value="">— 使用しない（高さ 0）—</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="export-selector-row">
          <label className="export-label" htmlFor="czml-name">名前列<span className="export-optional">（任意）</span></label>
          <select id="czml-name" className="export-select" value={nameCol} onChange={e => setNameCol(e.target.value)}>
            <option value="">— 使用しない（行番号を使用）—</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>
      <div className="style-section">
        <div className="style-section-title">スタイル設定</div>
        <div className="export-selector-row">
          <label className="export-label">ポイント色</label>
          <input type="color" className="style-color-input" value={pointColor} onChange={e => setPointColor(e.target.value)} />
        </div>
        <div className="export-selector-row">
          <label className="export-label">ポイントサイズ</label>
          <input type="number" className="style-number-input" value={pixelSize} min={1} max={50} onChange={e => setPixelSize(Number(e.target.value))} />
        </div>
      </div>
      <div className="download-buttons">
        <button className="btn btn-primary" onClick={handleDownload} disabled={!canExport}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          CZMLをダウンロード
        </button>
      </div>
    </div>
  );
}
