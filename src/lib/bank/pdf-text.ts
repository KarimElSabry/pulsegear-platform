// src/lib/bank/pdf-text.ts
// Server only. Reads a PDF with pdf.js (package "unpdf") and returns positioned lines. Nothing is sent anywhere.

import { linesFromItems, type PdfLine } from './pdf-lines'

export async function pdfToLines(bytes: Uint8Array): Promise<PdfLine[]> {
  const { getDocumentProxy } = await import('unpdf')
  const pdf = await getDocumentProxy(bytes)
  const pages: { str: string; x: number; y: number; width: number }[][] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const content = await (await pdf.getPage(i)).getTextContent()
    pages.push((content.items as unknown as { str?: string; transform: number[]; width: number }[])
      .filter((it) => typeof it.str === 'string')
      .map((it) => ({ str: it.str as string, x: it.transform[4], y: it.transform[5], width: it.width })))
  }
  return linesFromItems(pages)
}
