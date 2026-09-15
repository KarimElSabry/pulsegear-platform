// src/components/PriceSection.tsx

'use client'

import { useMemo, useState } from 'react'

type Props = {
  originalPrice: number
  productId: number
  productTitle: string
  isReservable: boolean
  discountEnabled: boolean
  status: 'available' | 'sold' | 'reserved' | 'out_of_stock'
}

type DiscountResponse = {
  success?: boolean
  code?: string
  discount_percent?: number
  error?: string
}

export default function PriceSection({
  originalPrice,
  productId,
  productTitle,
  isReservable,
  discountEnabled,
  status,
}: Props) {
  const [discountCode, setDiscountCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [checkingDiscount, setCheckingDiscount] = useState(false)
  const [discountError, setDiscountError] = useState('')
  const [discountSuccess, setDiscountSuccess] = useState('')

  const finalPrice = useMemo(() => {
    if (!discountEnabled || discountPercent <= 0) return originalPrice
    return Math.round(originalPrice * (1 - discountPercent / 100))
  }, [originalPrice, discountPercent, discountEnabled])

  const amountSaved = Math.max(0, originalPrice - finalPrice)
  const isUnavailable = status !== 'available'

  const handleApplyDiscount = async () => {
    if (!discountEnabled) {
      setDiscountPercent(0)
      setDiscountError('هذا المنتج غير مؤهل لاستخدام أكواد الخصم')
      setDiscountSuccess('')
      return
    }

    const normalizedCode = discountCode.trim().toUpperCase()

    if (!normalizedCode) {
      setDiscountError('من فضلك ادخل كود الخصم')
      setDiscountSuccess('')
      return
    }

    setCheckingDiscount(true)
    setDiscountError('')
    setDiscountSuccess('')

    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: normalizedCode,
          productId,
        }),
      })

      const data: DiscountResponse = await res.json()

      if (!res.ok || !data.success) {
        setDiscountPercent(0)
        setDiscountError(data.error || 'كود الخصم غير صالح')
        setDiscountSuccess('')
        return
      }

      const percent = Number(data.discount_percent ?? 0)

      if (percent <= 0) {
        setDiscountPercent(0)
        setDiscountError('قيمة الخصم غير صالحة')
        setDiscountSuccess('')
        return
      }

      setDiscountCode(normalizedCode)
      setDiscountPercent(percent)
      setDiscountSuccess(`تم تطبيق خصم ${percent}% بنجاح`)
      setDiscountError('')
    } catch (error) {
      console.error('Discount validation failed:', error)
      setDiscountPercent(0)
      setDiscountError('حصلت مشكلة أثناء التحقق من كود الخصم')
      setDiscountSuccess('')
    } finally {
      setCheckingDiscount(false)
    }
  }

  const handleRemoveDiscount = () => {
    setDiscountCode('')
    setDiscountPercent(0)
    setDiscountError('')
    setDiscountSuccess('')
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
      <div>
        <p className="text-zinc-400 text-sm mb-2">السعر</p>

        {discountEnabled && discountPercent > 0 ? (
          <div className="flex flex-col gap-1">
            <p className="text-zinc-500 line-through text-lg">
              {originalPrice.toLocaleString('en-EG')} EGP
            </p>
            <p className="text-3xl font-black text-green-400">
              {finalPrice.toLocaleString('en-EG')} EGP
            </p>
            <p className="text-sm text-green-300">
              وفرت {amountSaved.toLocaleString('en-EG')} EGP
            </p>
          </div>
        ) : (
          <p className="text-3xl font-black text-white">
            {originalPrice.toLocaleString('en-EG')} EGP
          </p>
        )}
      </div>

      <div className="border-t border-zinc-800 pt-5 space-y-3">
        <p className="text-white font-bold text-sm">كود الخصم</p>

        {!discountEnabled ? (
          <div className="bg-zinc-800/70 border border-zinc-700 rounded-xl px-4 py-3">
            <p className="text-sm text-zinc-400">
              الخصومات غير متاحة لهذا المنتج.
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="ادخل كود الخصم"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
              />

              {discountPercent > 0 ? (
                <button
                  onClick={handleRemoveDiscount}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-3 rounded-xl transition whitespace-nowrap"
                >
                  إزالة
                </button>
              ) : (
                <button
                  onClick={handleApplyDiscount}
                  disabled={checkingDiscount}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-4 py-3 rounded-xl transition whitespace-nowrap"
                >
                  {checkingDiscount ? 'جاري التحقق...' : 'تطبيق'}
                </button>
              )}
            </div>

            {discountError && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-2">
                {discountError}
              </p>
            )}

            {discountSuccess && (
              <p className="text-sm text-green-400 bg-green-900/20 border border-green-800 rounded-xl px-4 py-2">
                {discountSuccess}
              </p>
            )}
          </>
        )}
      </div>

      <div className="border-t border-zinc-800 pt-5">
        {isUnavailable ? (
          <button
            disabled
            className="w-full bg-zinc-700 text-zinc-400 font-bold py-3 rounded-xl cursor-not-allowed"
          >
            {status === 'sold'
              ? 'تم البيع'
              : status === 'reserved'
              ? 'محجوز'
              : 'غير متوفر'}
          </button>
        ) : isReservable ? (
          <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition">
            احجز المنتج
          </button>
        ) : (
          <button className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl transition">
            اطلب الآن
          </button>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        المنتج: {productTitle} #{productId}
      </p>
    </div>
  )
}