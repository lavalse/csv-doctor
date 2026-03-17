import type { GeoJSONExportOptions } from "../types/csv";

type PointGeometry = { type: "Point"; coordinates: number[] };

type GeoJSONFeature = {
  type: "Feature";
  geometry: PointGeometry | null;
  properties: Record<string, string | number | null>;
};

type GeoJSONFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
};

export function generateGeojson(
  headers: string[],
  rows: string[][],
  options: GeoJSONExportOptions
): string {
  const { lngColumn, latColumn, heightColumn, markerColor, markerSize } = options;

  const lngIdx = headers.indexOf(lngColumn);
  const latIdx = headers.indexOf(latColumn);
  const heightIdx = heightColumn !== "" ? headers.indexOf(heightColumn) : -1;

  const features: GeoJSONFeature[] = rows.map((row) => {
    const properties: Record<string, string | number | null> = {};
    headers.forEach((header, i) => {
      if (i === lngIdx || i === latIdx || i === heightIdx) return;
      const raw = row[i] ?? "";
      if (raw !== "") {
        const n = Number(raw);
        properties[header] = isNaN(n) ? raw : n;
      } else {
        properties[header] = null;
      }
    });

    const lngRaw = lngIdx >= 0 ? (row[lngIdx] ?? "") : "";
    const latRaw = latIdx >= 0 ? (row[latIdx] ?? "") : "";
    const lngVal = Number(lngRaw);
    const latVal = Number(latRaw);
    const lngValid = lngRaw !== "" && !isNaN(lngVal);
    const latValid = latRaw !== "" && !isNaN(latVal);

    if (!lngValid || !latValid) {
      return { type: "Feature", geometry: null, properties };
    }

    const coords: number[] = [lngVal, latVal];
    if (heightIdx >= 0) {
      const heightRaw = row[heightIdx] ?? "";
      const heightVal = Number(heightRaw);
      if (heightRaw !== "" && !isNaN(heightVal)) {
        coords.push(heightVal);
      }
    }

    properties["marker-color"] = markerColor;
    properties["marker-size"] = markerSize;

    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: coords },
      properties,
    };
  });

  const fc: GeoJSONFeatureCollection = { type: "FeatureCollection", features };
  return JSON.stringify(fc, null, 2);
}

export function geojsonFileName(originalFileName: string): string {
  return originalFileName.replace(/\.[^.]+$/, "") + ".geojson";
}
