import type { CleaningAction, CleaningOption } from "../types/csv";

export function filterEmptyRows(
  rows: string[][],
  options: CleaningOption
): { rows: string[][]; actions: CleaningAction[] } {
  if (!options.removeEmptyRows) return { rows, actions: [] };

  const filtered = rows.filter((row) => !row.every((cell) => cell.trim() === ""));
  const count = rows.length - filtered.length;
  const actions: CleaningAction[] = count > 0
    ? [{ type: "removed_empty_rows", count }]
    : [];

  return { rows: filtered, actions };
}
