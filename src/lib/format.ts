// src/lib/format.ts

export function formatEGP(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0 EGP'
  return value.toLocaleString('en-US') + ' EGP'
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0'
  return value.toLocaleString('en-US')
}