// src/lib/ask-message.ts
// The text a customer sends when they want to ask us something before ordering. Pure, so it is easy to test.

export type AskLine = { title: string; colorName?: string | null; quantity: number }

export function askMessage(lines: AskLine[]): string {
  if (lines.length === 0) return 'Hi Pulse Gear, I have a question before I order.'
  const list = lines.slice(0, 15).map((l) => `- ${l.title}${l.colorName ? ` (${l.colorName})` : ''} x${l.quantity}`).join('\n')
  const more = lines.length > 15 ? `\n…and ${lines.length - 15} more` : ''
  return `Hi Pulse Gear, I have a question before I order. These are the items in my cart:\n${list}${more}\n\nMy question: `
}
