/**
 * Minimal RFC-4180-friendly CSV parser.
 *
 * Sixtyfour result CSVs sometimes have multi-line quoted fields (e.g. the
 * `summary` column for a person), so a `line.split(",")` approach is not
 * sufficient. This parses the text once into rows, then rows[0] -> headers,
 * rest -> objects keyed by header.
 *
 * Not pulled from a dep so this package stays runtime-free (works in
 * Edge runtime, Node, browser, etc).
 */
export function parseResultCsv<T = Record<string, string>>(text: string): T[] {
  if (text.length === 0) return [];

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  // Strip BOM if present
  if (text.charCodeAt(0) === 0xfeff) i = 1;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0] ?? [];
  const out: T[] = [];
  for (let r = 1; r < rows.length; r += 1) {
    const cells = rows[r] ?? [];
    if (cells.length === 1 && (cells[0] ?? "").length === 0) continue;
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c += 1) {
      const key = headers[c] ?? "";
      if (key.length === 0) continue;
      obj[key] = cells[c] ?? "";
    }
    out.push(obj as T);
  }
  return out;
}
