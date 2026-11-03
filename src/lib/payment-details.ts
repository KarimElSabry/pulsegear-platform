// src/lib/payment-details.ts
// Where customers send the deposit. Shown on the order page. Change here if the accounts change.

export const PAYMENT_DETAILS = {
  instapay: { number: '+201205322444', name: 'Karim M**** H****' },
  bank: { bank: 'CIB', name: 'Karim Mohamed Hossam ElDin Hussein ElSabry', nameAr: 'كريم محمد حسام الدين حسين الصبري', iban: 'EG170010001200000100036489628', account: '100036489628' },
} as const

/** The deposit is half of the order, rounded up to a whole pound. */
export const DEPOSIT_SHARE = 0.5
export const depositFor = (total: number): number => Math.ceil(Math.max(0, total) * DEPOSIT_SHARE)

export const groupIban = (iban: string) => iban.replace(/(.{4})/g, '$1 ').trim()
