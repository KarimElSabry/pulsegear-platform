import { describe, expect, it } from 'vitest'
import { cleanReceiptInput, sniffReceipt } from '../receipts'
import { PAYMENT_DETAILS, depositFor, groupIban } from '../payment-details'

const bytes = (...b: number[]) => Uint8Array.from([...b, ...new Array(Math.max(0, 16 - b.length)).fill(0)])

describe('sniffReceipt', () => {
  it('recognises JPEG, PNG, WebP and PDF from the first bytes', () => {
    expect(sniffReceipt(bytes(0xff, 0xd8, 0xff, 0xe0))?.mime).toBe('image/jpeg')
    expect(sniffReceipt(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.mime).toBe('image/png')
    expect(sniffReceipt(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))?.mime).toBe('image/webp')
    expect(sniffReceipt(bytes(0x25, 0x50, 0x44, 0x46, 0x2d))?.mime).toBe('application/pdf')
  })
  it('rejects anything else, whatever it is called (HTML, scripts, executables, tiny files)', () => {
    expect(sniffReceipt(new TextEncoder().encode('<html><script>alert(1)</script></html>'))).toBeNull()
    expect(sniffReceipt(bytes(0x4d, 0x5a, 0x90))).toBeNull()
    expect(sniffReceipt(bytes(0xff, 0xd8))).toBeNull()
    expect(sniffReceipt(new Uint8Array(0))).toBeNull()
  })
})

describe('cleanReceiptInput', () => {
  it('defaults to Instapay and accepts empty optional fields', () => {
    expect(cleanReceiptInput({})).toEqual({ ok: true, value: { method: 'instapay', amountEgp: null, payerName: null, payerPhone: null } })
  })
  it('cleans the amount, name and phone', () => {
    expect(cleanReceiptInput({ method: 'bank', amount: '31,500', payerName: '  Ali  ', payerPhone: '01012345678' }))
      .toEqual({ ok: true, value: { method: 'bank', amountEgp: 31500, payerName: 'Ali', payerPhone: '01012345678' } })
  })
  it('rejects a nonsense amount or phone', () => {
    expect(cleanReceiptInput({ amount: 'abc' }).ok).toBe(false)
    expect(cleanReceiptInput({ amount: '-5' }).ok).toBe(false)
    expect(cleanReceiptInput({ payerPhone: '12' }).ok).toBe(false)
  })
  it('treats an unknown method as Instapay', () => {
    expect(cleanReceiptInput({ method: 'cash' })).toMatchObject({ ok: true, value: { method: 'instapay' } })
  })
})

describe('payment details', () => {
  it('rounds the deposit up to a whole pound', () => {
    expect(depositFor(63000)).toBe(31500)
    expect(depositFor(10001)).toBe(5001)
    expect(depositFor(0)).toBe(0)
  })
  it('the IBAN is a valid Egyptian IBAN (mod 97) and contains the account number', () => {
    const iban = PAYMENT_DETAILS.bank.iban
    expect(iban).toHaveLength(29)
    const digits = [...(iban.slice(4) + iban.slice(0, 4))].map((c) => parseInt(c, 36)).join('')
    let rest = 0
    for (const d of digits) rest = (rest * 10 + Number(d)) % 97
    expect(rest).toBe(1)
    expect(iban.endsWith(PAYMENT_DETAILS.bank.account.padStart(17, '0'))).toBe(true)
    expect(groupIban(iban).split(' ')[0]).toBe('EG17')
  })
})
