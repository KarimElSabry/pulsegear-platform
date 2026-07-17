// src/components/PriceSection.tsx

'use client'

import { useState } from 'react'
import { useLikes } from '@/hooks/useLikes'
import DiscountInput from './DiscountInput'
import ReserveButton from './ReserveButton'

interface Props {
  originalPrice: number
  productId: number
  productTitle: string
  isReservable: boolean
  status: string
}

export default function PriceSection({
  originalPrice,
  productId,
  productTitle,
  isReservable,
  status,
}: Props) {
  const [finalPrice, setFinalPrice] = useState(originalPrice)
  const [discountPercent, setDiscountPercent] = useState<number | null>(null)
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [igCopied, setIgCopied] = useState(false)

  const { likes, loading, addLike, liked, isSold } = useLikes(productId, status)

  const handleDiscountApplied = (
    discountedPrice: number,
    percent: number,
    code: string
  ) => {
    setFinalPrice(discountedPrice)
    setDiscountPercent(percent)
    setDiscountCode(code)
  }

  const handleDiscountRemoved = () => {
    setFinalPrice(originalPrice)
    setDiscountPercent(null)
    setDiscountCode(null)
  }

  // ✅ WhatsApp & Instagram messages — فيهم الكود لو موجود
  const waMessage = discountCode
    ? `I'm interested in: ${productTitle}\n🏷️ Discount Code: ${discountCode} (${discountPercent}% off)\n💰 My Price: ${finalPrice.toLocaleString()} EGP`
    : `I'm interested in: ${productTitle}`

  const igMessage = discountCode
    ? `I'm interested in: ${productTitle}\n🏷️ Discount Code: ${discountCode} (${discountPercent}% off)\n💰 My Price: ${finalPrice.toLocaleString()} EGP`
    : `I'm interested in: ${productTitle}`

  const handleInstagramClick = () => {
    navigator.clipboard.writeText(igMessage)
    setIgCopied(true)
    setTimeout(() => setIgCopied(false), 3000)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Price Box */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-sm text-zinc-500 mb-1">Final Price in Egypt</p>

        {discountPercent && (
          <div className="flex items-center gap-3 mb-1">
            <p className="text-2xl text-zinc-500 line-through">
              {originalPrice.toLocaleString()} EGP
            </p>
            <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-2 py-1 rounded-full">
              -{discountPercent}%
            </span>
          </div>
        )}

        <p className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
          {finalPrice.toLocaleString('en-US')} EGP
        </p>

        <p className="text-xs text-zinc-500 mt-2">
          ✅ Includes shipping, customs & delivery.
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          🚚 Shipping takes from 1-2 weeks.
        </p>
      </div>

      {/* Likes Button */}
      <button
        onClick={addLike}
        disabled={liked || isSold}
        className={`flex items-center gap-2 w-fit px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200
          ${isSold
            ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed opacity-50'
            : liked
              ? 'bg-blue-500 text-white cursor-not-allowed'
              : 'bg-zinc-800 text-white hover:bg-blue-500 cursor-pointer'
          }`}
      >
        <span className="text-lg">👍</span>
        <span>{loading ? '...' : likes} {likes === 1 ? 'Like' : 'Likes'}</span>
      </button>

      {/* Discount Input */}
      <DiscountInput
        originalPrice={originalPrice}
        onDiscountApplied={handleDiscountApplied}
        onDiscountRemoved={handleDiscountRemoved}
      />

      {/* Reserve Button */}
      <ReserveButton
        productId={productId}
        productTitle={productTitle}
        isReservable={isReservable}
        status={status as any}
        discountedPrice={discountPercent ? finalPrice : undefined}
        discountCode={discountCode ?? undefined}
      />

      {/* CTA Buttons */}
      <div className="flex flex-col gap-3">

        {/* WhatsApp — message فيها الكود ✅ */}
        <a
          href={`https://wa.me/+201205322444?text=${encodeURIComponent(waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-400 text-white font-black text-lg py-4 px-8 rounded-full text-center transition-all duration-200 uppercase tracking-wide"
        >
          📲 Reserve via WhatsApp
        </a>

        {/* Instagram — copy message to clipboard ✅ */}
        <a
          href="https://instagram.com/pulsegear_egypt"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleInstagramClick}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90 text-white font-black text-lg py-4 px-8 rounded-full text-center transition-all duration-200 uppercase tracking-wide"
        >
          {igCopied ? '✅ Message Copied! Opening Instagram...' : '📸 Reserve via Instagram'}
        </a>

        {/* ✅ Hint لما يكون فيه discount code */}
        {discountCode && (
          <p className="text-xs text-zinc-400 text-center">
            💡 Your discount code{' '}
            <span className="text-green-400 font-bold uppercase">{discountCode}</span>{' '}
            {igCopied
              ? 'has been copied! Paste it in your Instagram message 📋'
              : 'will be included in your WhatsApp message automatically ✅'}
          </p>
        )}

      </div>
    </div>
  )
}