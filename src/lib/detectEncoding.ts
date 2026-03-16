import Encoding from "encoding-japanese";
import type { DetectedEncoding } from "../types/csv";

export function detectEncoding(buffer: ArrayBuffer): DetectedEncoding {
  const bytes = new Uint8Array(buffer);

  // Check for UTF-8 BOM (EF BB BF)
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return "utf-8-bom";
  }

  const detected = Encoding.detect(bytes);

  if (detected === "UTF8" || detected === "ASCII" || detected === "UNICODE") {
    return "utf-8";
  }

  if (detected === "SJIS") {
    // Check for CP932 extended bytes (0xFA and above)
    for (let i = 0; i < bytes.length - 1; i++) {
      const b = bytes[i];
      if (b >= 0xfa && b <= 0xfc) {
        return "cp932";
      }
    }
    return "shift_jis";
  }

  return "unknown";
}
