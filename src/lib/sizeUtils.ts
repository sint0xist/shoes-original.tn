// Turns a size label like "43", "43 1/2", "46,5" or "46.5" into a comparable number.
// Falls back to a very large number for unrecognized formats so they sort last instead of crashing a sort.
export function sizeSortValue(label: string): number {
  if (!label) return Number.MAX_SAFE_INTEGER;
  const trimmed = label.trim();

  const halfMatch = trimmed.match(/^(\d+)\s*1\/2$/);
  if (halfMatch) {
    return Number(halfMatch[1]) + 0.5;
  }

  const decimalMatch = trimmed.match(/^(\d+)[.,](\d+)$/);
  if (decimalMatch) {
    return Number(`${decimalMatch[1]}.${decimalMatch[2]}`);
  }

  const numericMatch = trimmed.match(/^(\d+(\.\d+)?)/);
  if (numericMatch) {
    return Number(numericMatch[1]);
  }

  return Number.MAX_SAFE_INTEGER;
}

export function sortSizes<T extends { size: string }>(sizes: T[]): T[] {
  return [...sizes].sort((a, b) => sizeSortValue(a.size) - sizeSortValue(b.size));
}

export function sortSizeLabels(labels: string[]): string[] {
  return [...labels].sort((a, b) => sizeSortValue(a) - sizeSortValue(b));
}
