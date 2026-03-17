import type { KMLExportOptions } from "../types/csv";

function hexToKmlColor(hex: string, alpha = "ff"): string {
  // KML color order: aabbggrr
  const r = hex.slice(1, 3);
  const g = hex.slice(3, 5);
  const b = hex.slice(5, 7);
  return `${alpha}${b}${g}${r}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateKml(
  headers: string[],
  rows: string[][],
  options: KMLExportOptions
): string {
  const { lngColumn, latColumn, heightColumn, nameColumn, descriptionColumn, iconColor, iconScale } = options;
  const lngIdx = headers.indexOf(lngColumn);
  const latIdx = headers.indexOf(latColumn);
  const heightIdx = heightColumn !== "" ? headers.indexOf(heightColumn) : -1;
  const nameIdx = nameColumn !== "" ? headers.indexOf(nameColumn) : -1;
  const descIdx = descriptionColumn !== "" ? headers.indexOf(descriptionColumn) : -1;

  const specialIdxs = new Set([lngIdx, latIdx, heightIdx, nameIdx, descIdx].filter(i => i >= 0));

  const placemarks = rows.map((row, rowIndex) => {
    const name = nameIdx >= 0 ? (row[nameIdx] ?? "") || String(rowIndex + 1) : String(rowIndex + 1);
    const desc = descIdx >= 0 ? (row[descIdx] ?? "") : "";
    const lngRaw = lngIdx >= 0 ? (row[lngIdx] ?? "") : "";
    const latRaw = latIdx >= 0 ? (row[latIdx] ?? "") : "";
    const lngVal = Number(lngRaw);
    const latVal = Number(latRaw);
    const lngValid = lngRaw !== "" && !isNaN(lngVal);
    const latValid = latRaw !== "" && !isNaN(latVal);

    let coordStr = "";
    let hasHeight = false;
    if (lngValid && latValid) {
      coordStr = `${lngVal},${latVal}`;
      if (heightIdx >= 0) {
        const heightRaw = row[heightIdx] ?? "";
        const heightVal = Number(heightRaw);
        if (heightRaw !== "" && !isNaN(heightVal)) {
          coordStr += `,${heightVal}`;
          hasHeight = true;
        }
      }
    }

    const extData = headers
      .map((header, i) => {
        if (specialIdxs.has(i)) return "";
        const val = row[i] ?? "";
        return `      <Data name="${escapeXml(header)}"><value>${escapeXml(val)}</value></Data>`;
      })
      .filter(Boolean)
      .join("\n");

    const pointLines = coordStr
      ? [
          "      <Point>",
          hasHeight ? "        <altitudeMode>absolute</altitudeMode>" : "        <altitudeMode>clampToGround</altitudeMode>",
          `        <coordinates>${coordStr}</coordinates>`,
          "      </Point>",
        ].join("\n")
      : "";

    return [
      "    <Placemark>",
      `      <name>${escapeXml(name)}</name>`,
      desc ? `      <description><![CDATA[${desc}]]></description>` : "",
      "      <styleUrl>#csvStyle</styleUrl>",
      pointLines,
      extData ? `      <ExtendedData>\n${extData}\n      </ExtendedData>` : "",
      "    </Placemark>",
    ].filter(Boolean).join("\n");
  });

  const styleBlock = [
    '  <Style id="csvStyle">',
    "    <IconStyle>",
    `      <color>${hexToKmlColor(iconColor)}</color>`,
    `      <scale>${iconScale}</scale>`,
    "    </IconStyle>",
    "  </Style>",
  ].join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<kml xmlns="http://www.opengis.net/kml/2.2">',
    "  <Document>",
    styleBlock,
    ...placemarks,
    "  </Document>",
    "</kml>",
  ].join("\n");
}

export function kmlFileName(originalFileName: string): string {
  return originalFileName.replace(/\.[^.]+$/, "") + ".kml";
}
