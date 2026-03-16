import type { CleaningAction, CleaningOption } from "../types/csv";

export function normalizeCells(rows: string[][], options: CleaningOption): { rows: string[][]; actions: CleaningAction[] } {
  let multilineCount = 0;

  const normalized = rows.map((row) =>
    row.map((cell) => {
      let val = cell;
      if (options.trimCells) val = val.trim();
      if (options.normalizeNFKC) val = val.normalize("NFKC");
      if (options.normalizeMultilineCells && /[\r\n]/.test(val)) {
        val = val.replace(/[\r\n]+/g, " ");
        multilineCount++;
      }
      return val;
    })
  );

  const actions: CleaningAction[] = [];
  if (multilineCount > 0) {
    actions.push({ type: "normalized_multiline_cells", count: multilineCount });
  }

  return { rows: normalized, actions };
}
