export type CoordinateDetection = {
  lngCol: string;
  latCol: string;
};

const TIER1_LNG = ["longitude", "lng", "lon", "経度", "经度", "東経"];
const TIER1_LAT = ["latitude", "lat", "緯度", "纬度", "北緯"];

const TIER2_LNG = ["long", "x", "easting"];
const TIER2_LAT = ["y", "northing"];

function findExact(headers: string[], keywords: string[]): string {
  for (const h of headers) {
    const lower = h.toLowerCase();
    for (const kw of keywords) {
      if (lower === kw) return h;
    }
  }
  return "";
}

function findContains(headers: string[], keywords: string[]): string {
  for (const h of headers) {
    const lower = h.toLowerCase();
    for (const kw of keywords) {
      if (lower.includes(kw)) return h;
    }
  }
  return "";
}

export function detectCoordinateColumns(headers: string[]): CoordinateDetection {
  // Tier 1: exact match on geo-specific keywords
  const t1Lng = findExact(headers, TIER1_LNG);
  const t1Lat = findExact(headers, TIER1_LAT);
  if (t1Lng && t1Lat && t1Lng !== t1Lat) return { lngCol: t1Lng, latCol: t1Lat };

  // Tier 2: exact match on common abbreviations (x/y, easting/northing, long)
  const t2Lng = findExact(headers, TIER2_LNG);
  const t2Lat = findExact(headers, TIER2_LAT);
  if (t2Lng && t2Lat && t2Lng !== t2Lat) return { lngCol: t2Lng, latCol: t2Lat };

  // Tier 3: substring match using Tier 1 keywords only (avoid false positives from "long" etc.)
  const t3Lng = findContains(headers, TIER1_LNG);
  const t3Lat = findContains(headers, TIER1_LAT);
  if (t3Lng && t3Lat && t3Lng !== t3Lat) return { lngCol: t3Lng, latCol: t3Lat };

  return { lngCol: "", latCol: "" };
}
