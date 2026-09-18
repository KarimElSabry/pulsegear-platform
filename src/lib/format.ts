// src/lib/format.ts

export function formatEGP(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0 EGP'
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  }) + ' EGP'
}

export function formatEUR(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '€0'
  return (
    '€' +
    value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0'
  return value.toLocaleString('en-US')
}