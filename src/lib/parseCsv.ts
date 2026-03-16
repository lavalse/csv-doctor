import Papa from "papaparse";
import type { Delimiter } from "../types/csv";

export function parseCsv(
  text: string,
  delimiter: Delimiter
): { data: string[][]; errors: Papa.ParseError[] } {
  const result = Papa.parse<string[]>(text, {
    delimiter,
    header: false,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
  });

  return {
    data: result.data,
    errors: result.errors,
  };
}
