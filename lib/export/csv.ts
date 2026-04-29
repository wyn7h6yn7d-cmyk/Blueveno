export function csvEscape(value: unknown): string {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

export function recordsToCsv<T extends Record<string, unknown>>(
  headers: Array<{ key: keyof T; label: string }>,
  rows: T[],
): string {
  const head = headers.map((h) => csvEscape(h.label)).join(",");
  const body = rows.map((row) => headers.map((h) => csvEscape(row[h.key])).join(",")).join("\n");
  return `${head}\n${body}`;
}

export function triggerCsvDownload(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function fileDate(today = new Date()): string {
  return today.toISOString().slice(0, 10);
}
