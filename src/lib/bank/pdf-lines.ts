// src/lib/bank/pdf-lines.ts
// A PDF page becomes lines of tokens with their horizontal position. Parsers work on this shape, so they do not care whether the
// text came from pdf.js on the server or from a text layout in a test.

export interface PdfToken { x: number; xEnd: number; text: string }
export type PdfLine = PdfToken[]

/** pdf.js text items -> lines (same baseline), left to right, empty and blank pieces dropped. */
export function linesFromItems(pages: { str: string; x: number; y: number; width: number }[][]): PdfLine[] {
  const out: PdfLine[] = []
  for (const items of pages) {
    const rows: { y: number; tokens: PdfToken[] }[] = []
    for (const it of items) {
      const text = it.str.replace(/[‎‏‪-‮]/g, '').trim()
      if (!text) continue
      let row = rows.find((r) => Math.abs(r.y - it.y) <= 2.5)
      if (!row) { row = { y: it.y, tokens: [] }; rows.push(row) }
      row.tokens.push({ x: it.x, xEnd: it.x + it.width, text })
    }
    rows.sort((a, b) => b.y - a.y) // top of the page first
    for (const r of rows) out.push(r.tokens.sort((a, b) => a.x - b.x))
  }
  return out
}

/** Text with the page layout kept (like `pdftotext -layout`) -> lines. Pieces are split at 2+ spaces. A form feed starts a new page. */
export function linesFromLayoutText(text: string): PdfLine[] {
  const out: PdfLine[] = []
  for (const raw of text.replace(/\f/g, '\n').split('\n')) {
    const tokens: PdfToken[] = []
    const re = /\S+(?: \S+)*/g
    let m: RegExpExecArray | null
    while ((m = re.exec(raw))) tokens.push({ x: m.index, xEnd: m.index + m[0].length, text: m[0].replace(/[‎‏‪-‮]/g, '') })
    out.push(tokens)
  }
  return out
}
