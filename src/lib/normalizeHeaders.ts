import type { CleaningAction, CleaningOption, ValidationWarning } from "../types/csv";

export function normalizeHeaders(
  rawHeaders: string[],
  options: CleaningOption
): { headers: string[]; actions: CleaningAction[]; warnings: ValidationWarning[] } {
  const actions: CleaningAction[] = [];
  const warnings: ValidationWarning[] = [];

  let headers = rawHeaders.map((h) => {
    let val = h;
    if (options.trimHeaders) val = val.trim();
    if (options.normalizeNFKC) val = val.normalize("NFKC");
    return val;
  });

  // Fill empty headers
  let emptyCount = 0;
  headers = headers.map((h, i) => {
    if (h === "") {
      warnings.push({ type: "empty_header", column: i + 1 });
      emptyCount++;
      return `Column_${i + 1}`;
    }
    return h;
  });
  if (emptyCount > 0) {
    actions.push({ type: "filled_empty_headers", count: emptyCount });
  }

  // Deduplicate headers
  const seen = new Map<string, number>();
  let dupCount = 0;
  headers = headers.map((h) => {
    const count = seen.get(h) ?? 0;
    if (count > 0) {
      warnings.push({ type: "duplicate_header", name: h });
      dupCount++;
      const newName = `${h}_${count + 1}`;
      seen.set(h, count + 1);
      return newName;
    }
    seen.set(h, 1);
    return h;
  });
  if (dupCount > 0) {
    actions.push({ type: "renamed_duplicate_headers", count: dupCount });
  }

  return { headers, actions, warnings };
}
