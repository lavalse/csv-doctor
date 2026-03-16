import Papa from "papaparse";
import type { Delimiter } from "../types/csv";

export function regenerateCsv(
  headers: string[],
  rows: string[][],
  detectedDelimiter: Delimiter,
  forceComma: boolean
): string {
  return Papa.unparse(
    { fields: headers, data: rows },
    {
      delimiter: forceComma ? "," : detectedDelimiter,
      newline: "\r\n",
    }
  );
}
