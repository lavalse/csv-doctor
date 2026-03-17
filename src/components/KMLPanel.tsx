import { useState } from "react";
import type { KMLExportOptions } from "../types/csv";
import { generateKml, kmlFileName } from "../lib/generateKml";

type Props = { headers: string[]; rows: string[][]; originalFileName: string };

export function KMLPanel({ headers, rows, originalFileName }: Props) {
  const [lngCol, setLngCol] = useState("");
  const [latCol, setLatCol] = useState("");
  const [heightCol, setHeightCol] = useState("");
  const [nameCol, setNameCol] = useState("");
  const [descCol, setDescCol] = useState("");
  const [iconColor, setIconColor] = useState("#2563eb");
  const [iconScale, setIconScale] = useState(1.0);

  const canExport = lngCol !== "" && latCol !== "";

  const handleDownload = () => {
    if (!canExport) return;
    const options: KMLExportOptions = { lngColumn: lngCol, latColumn: latCol, heightColumn: heightCol, nameColumn: nameCol, descriptionColumn: descCol, iconColor, iconScale };
    const text = generateKml(headers, rows, options);
    const blob = new Blob([text], { type: "application/vnd.google-earth.kml+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = kmlFileName(originalFileName);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card kml-card">
      <h2 className="card-title">KMLエクスポート</h2>
      <p className="download-desc">
        Google Earth / ArcGIS 向けの KML 2.2 形式で出力します。座標が無効な行は
        <code>Point</code> なしの Placemark として出力されます。
      </p>
      <div className="export-selectors">
        <div className="export-selector-row">
          <label className="export-label" htmlFor="kml-lng">経度列<span className="export-required">（必須）</span></label>
          <select id="kml-lng" className="export-select" value={lngCol} onChange={e => setLngCol(e.target.value)}>
            <option value="">— 選択してください —</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="export-selector-row">
          <label className="export-label" htmlFor="kml-lat">緯度列<span className="export-required">（必須）</span></label>
          <select id="kml-lat" className="export-select" value={latCol} onChange={e => setLatCol(e.target.value)}>
            <option value="">— 選択してください —</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="export-selector-row">
          <label className="export-label" htmlFor="kml-height">高さ列<span className="export-optional">（任意）</span></label>
          <select id="kml-height" className="export-select" value={heightCol} onChange={e => setHeightCol(e.target.value)}>
            <option value="">— 使用しない —</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="export-selector-row">
          <label className="export-label" htmlFor="kml-name">名前列<span className="export-optional">（任意）</span></label>
          <select id="kml-name" className="export-select" value={nameCol} onChange={e => setNameCol(e.target.value)}>
            <option value="">— 使用しない（行番号を使用）—</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="export-selector-row">
          <label className="export-label" htmlFor="kml-desc">説明列<span className="export-optional">（任意）</span></label>
          <select id="kml-desc" className="export-select" value={descCol} onChange={e => setDescCol(e.target.value)}>
            <option value="">— 使用しない —</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>
      <div className="style-section">
        <div className="style-section-title">スタイル設定</div>
        <div className="export-selector-row">
          <label className="export-label">アイコン色</label>
          <input type="color" className="style-color-input" value={iconColor} onChange={e => setIconColor(e.target.value)} />
        </div>
        <div className="export-selector-row">
          <label className="export-label">アイコンスケール</label>
          <input type="number" className="style-number-input" value={iconScale} min={0.1} max={5.0} step={0.1} onChange={e => setIconScale(Number(e.target.value))} />
        </div>
      </div>
      <div className="download-buttons">
        <button className="btn btn-primary" onClick={handleDownload} disabled={!canExport}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          KMLをダウンロード
        </button>
      </div>
    </div>
  );
}
