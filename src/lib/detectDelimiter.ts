import type { Delimiter } from "../types/csv";

export function detectDelimiter(text: string): Delimiter {
  const candidates: Delimiter[] = [",", "\t", ";"];
  const lines = text.split("\n").filter((l) => l.trim().length > 0).slice(0, 5);

  if (lines.length === 0) return ",";

  let bestDelimiter: Delimiter = ",";
  let bestScore = -1;

  for (const delim of candidates) {
    const counts = lines.map((line) => {
      let count = 0;
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') inQuote = !inQuote;
        else if (!inQuote && line[i] === delim) count++;
      }
      return count;
    });

    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    if (mean === 0) continue;

    const variance =
      counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length;
    const score = mean / (variance + 1);

    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = delim;
    }
  }

  return bestDelimiter;
}
