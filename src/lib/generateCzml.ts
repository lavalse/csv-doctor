import type { CZMLExportOptions } from "../types/csv";

type CZMLPoint = {
  color: { rgba: [number, number, number, number] };
  pixelSize: number;
  outlineColor: { rgba: [number, number, number, number] };
  outlineWidth: number;
};

type CZMLPacket = {
  id: string;
  name?: string;
  version?: string;
  position?: { cartographicDegrees: number[] };
  point?: CZMLPoint;
  properties?: Record<string, string | number>;
};

function hexToRgba(hex: string, alpha = 255): [number, number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, alpha];
}

export function generateCzml(
  headers: string[],
  rows: string[][],
  options: CZMLExportOptions
): string {
  const { lngColumn, latColumn, heightColumn, nameColumn, pointColor, pixelSize } = options;
  const lngIdx = headers.indexOf(lngColumn);
  const latIdx = headers.indexOf(latColumn);
  const heightIdx = heightColumn !== "" ? headers.indexOf(heightColumn) : -1;
  const nameIdx = nameColumn !== "" ? headers.indexOf(nameColumn) : -1;

  const coordAndNameIdxs = new Set([lngIdx, latIdx, heightIdx, nameIdx].filter(i => i >= 0));

  const packets: CZMLPacket[] = [
    { id: "document", name: "document", version: "1.0" },
  ];

  rows.forEach((row, rowIndex) => {
    const properties: Record<string, string | number> = {};
    headers.forEach((header, i) => {
      if (coordAndNameIdxs.has(i)) return;
      const raw = row[i] ?? "";
      if (raw === "") return; // skip empty values
      const n = Number(raw);
      properties[header] = isNaN(n) ? raw : n;
    });

    const name = nameIdx >= 0 ? (row[nameIdx] ?? "") || String(rowIndex + 1) : String(rowIndex + 1);
    const lngRaw = lngIdx >= 0 ? (row[lngIdx] ?? "") : "";
    const latRaw = latIdx >= 0 ? (row[latIdx] ?? "") : "";
    const lngVal = Number(lngRaw);
    const latVal = Number(latRaw);
    const lngValid = lngRaw !== "" && !isNaN(lngVal);
    const latValid = latRaw !== "" && !isNaN(latVal);

    const packet: CZMLPacket = {
      id: String(rowIndex),
      name,
      ...(Object.keys(properties).length > 0 ? { properties } : {}),
    };

    if (lngValid && latValid) {
      let height = 0;
      if (heightIdx >= 0) {
        const heightRaw = row[heightIdx] ?? "";
        const heightVal = Number(heightRaw);
        if (heightRaw !== "" && !isNaN(heightVal)) height = heightVal;
      }
      packet.position = { cartographicDegrees: [lngVal, latVal, height] };
      packet.point = {
        color: { rgba: hexToRgba(pointColor) },
        pixelSize,
        outlineColor: { rgba: [0, 0, 0, 255] },
        outlineWidth: 1,
      };
    }

    packets.push(packet);
  });

  return JSON.stringify(packets, null, 2);
}

export function czmlFileName(originalFileName: string): string {
  return originalFileName.replace(/\.[^.]+$/, "") + ".czml";
}
