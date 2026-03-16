import type { CleaningAction, CleaningOption } from "../types/csv";

export function normalizeText(
  raw: string,
  options: CleaningOption
): { text: string; actions: CleaningAction[] } {
  const actions: CleaningAction[] = [];
  let text = raw;

  // 1. Strip leading BOM
  if (text.startsWith("\uFEFF")) {
    text = text.slice(1);
    actions.push({ type: "removed_bom" });
  }

  // 2. Normalize line endings
  const before = text;
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (text !== before) {
    actions.push({ type: "normalized_line_breaks" });
  }

  // 3. Remove invisible chars
  if (options.removeInvisibleChars) {
    const invisibleRegex =
      /[\u0000-\u0008\u000E-\u001F\u007F\u00AD\u200B-\u200D\u2060\uFEFF]/g;
    const matches = text.match(invisibleRegex);
    if (matches && matches.length > 0) {
      text = text.replace(invisibleRegex, "");
      actions.push({ type: "removed_invisible_chars", count: matches.length });
    }
  }

  // 4. NFKC normalization
  if (options.normalizeNFKC) {
    const normalized = text.normalize("NFKC");
    if (normalized !== text) {
      text = normalized;
      actions.push({ type: "normalized_unicode_nfkc" });
    }
  }

  return { text, actions };
}
