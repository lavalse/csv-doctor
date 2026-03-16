import { useEffect, useState } from "react";
import type { GeoJSONExportOptions } from "../types/csv";
import { generateGeojson, geojsonFileName } from "../lib/generateGeojson";

type Props = {
  headers: string[];
  rows: string[][];
  originalFileName: string;
};

export function GeoJSONPanel({ headers, rows, originalFileName }: Props) {
  const [lngCol, setLngCol] = useState<string>("");
  const [latCol, setLatCol] = useState<string>("");
  const [heightCol, setHeightCol] = useState<string>("");

  useEffect(() => {
    setLngCol("");
    setLatCol("");
    setHeightCol("");
  }, [headers]);

  const canExport = lngCol !== "" && latCol !== "";

  const handleDownload = () => {
    if (!canExport) return;
    const options: GeoJSONExportOptions = { lngColumn: lngCol, latColumn: latCol, heightColumn: heightCol };
    const geojsonText = generateGeojson(headers, rows, options);
    const blob = new Blob([geojsonText], { type: "application/geo+json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = geojsonFileName(originalFileName);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card geojson-card">
      <h2 className="card-title">GeoJSONエクスポート</h2>
      <p className="download-desc">
        座標列を指定してGeoJSON（FeatureCollection）を出力します。
        緯度・経度が無効な行は <code>geometry: null</code> で出力されます。
      </p>
      <div className="geojson-selectors">
        <div className="geojson-selector-row">
          <label className="geojson-label" htmlFor="geojson-lng">
            経度列<span className="geojson-required">（必須）</span>
          </label>
          <select id="geojson-lng" className="geojson-select" value={lngCol} onChange={(e) => setLngCol(e.target.value)}>
            <option value="">— 選択してください —</option>
            {headers.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="geojson-selector-row">
          <label className="geojson-label" htmlFor="geojson-lat">
            緯度列<span className="geojson-required">（必須）</span>
          </label>
          <select id="geojson-lat" className="geojson-select" value={latCol} onChange={(e) => setLatCol(e.target.value)}>
            <option value="">— 選択してください —</option>
            {headers.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div className="geojson-selector-row">
          <label className="geojson-label" htmlFor="geojson-height">
            高さ列<span className="geojson-optional">（任意）</span>
          </label>
          <select id="geojson-height" className="geojson-select" value={heightCol} onChange={(e) => setHeightCol(e.target.value)}>
            <option value="">— 使用しない —</option>
            {headers.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>
      <div className="download-buttons">
        <button className="btn btn-primary" onClick={handleDownload} disabled={!canExport}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          GeoJSONをダウンロード
        </button>
      </div>
    </div>
  );
}
