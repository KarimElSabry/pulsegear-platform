// src/lib/digits.ts
// Lets numbers typed with an Arabic keyboard (٠١٢٣٤٥٦٧٨٩ or ۰۱۲۳۴۵۶۷۸۹) work like 0123456789.

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩'
const EXTENDED = '۰۱۲۳۴۵۶۷۸۹'

/** Arabic digits to Latin digits, Arabic decimal mark (٫) to ".", Arabic thousands mark (٬) removed. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (c) => String(ARABIC_INDIC.indexOf(c)))
    .replace(/[۰-۹]/g, (c) => String(EXTENDED.indexOf(c)))
    .replace(/٫/g, '.')
    .replace(/٬/g, '')
}
