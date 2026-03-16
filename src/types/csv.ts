export type DetectedEncoding = "utf-8" | "utf-8-bom" | "shift_jis" | "cp932" | "unknown";
export type Delimiter = "," | ";" | "\t";

export type CleaningOption = {
  normalizeNFKC: boolean;
  removeInvisibleChars: boolean;
  trimHeaders: boolean;
  trimCells: boolean;
  normalizeMultilineCells: boolean;
  removeEmptyRows: boolean;
  forceCommaDelimiter: boolean;
};

export type CleaningAction =
  | { type: "removed_bom" }
  | { type: "normalized_line_breaks" }
  | { type: "normalized_unicode_nfkc" }
  | { type: "removed_invisible_chars"; count: number }
  | { type: "renamed_duplicate_headers"; count: number }
  | { type: "filled_empty_headers"; count: number }
  | { type: "normalized_multiline_cells"; count: number }
  | { type: "removed_empty_rows"; count: number };

export type ValidationWarning =
  | { type: "inconsistent_column_count"; row: number; expected: number; actual: number }
  | { type: "empty_header"; column: number }
  | { type: "duplicate_header"; name: string }
  | { type: "parse_error"; message: string; row?: number };

export type ParsedCsvData = { headers: string[]; rows: string[][] };

export type GeoJSONExportOptions = {
  lngColumn: string;    // header name; empty string = not selected
  latColumn: string;    // header name; empty string = not selected
  heightColumn: string; // header name; empty string = not used
};

export type ProcessingResult = {
  encoding: DetectedEncoding;
  delimiter: Delimiter;
  parsed: ParsedCsvData;
  actions: CleaningAction[];
  warnings: ValidationWarning[];
  cleanCsvText: string;
  originalFileName: string;
};
