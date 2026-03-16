import Papa from "papaparse";
import type { ValidationWarning } from "../types/csv";

export function validateRows(
  headers: string[],
  rows: string[][],
  parseErrors: Papa.ParseError[]
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.length !== headers.length) {
      warnings.push({
        type: "inconsistent_column_count",
        row: i + 2, // 1-based, +1 for header row
        expected: headers.length,
        actual: row.length,
      });
    }
  }

  for (const err of parseErrors) {
    warnings.push({
      type: "parse_error",
      message: err.message,
      row: err.row !== undefined ? err.row + 1 : undefined,
    });
  }

  return warnings;
}
