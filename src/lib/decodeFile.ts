import Encoding from "encoding-japanese";
import type { DetectedEncoding } from "../types/csv";

export function decodeFile(buffer: ArrayBuffer, encoding: DetectedEncoding): string {
  const bytes = new Uint8Array(buffer);

  if (encoding === "shift_jis" || encoding === "cp932") {
    const converted = Encoding.convert(bytes, {
      to: "UTF8",
      from: "SJIS",
      type: "array",
    }) as number[];
    return new TextDecoder("utf-8").decode(new Uint8Array(converted));
  }

  // utf-8, utf-8-bom, unknown
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}
