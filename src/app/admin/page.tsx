// src/app/admin/page.tsx

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { addProduct } from './actions'

export default function AdminPage() {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [manualUrls, setManualUrls] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  // ─── Handle Image Upload ───────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    setUploading(true)

    const uploaded: string[] = []

    for (const file of files) {
      const ext      = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: false })

      if (error) {
        console.error('Upload error:', error.message)
        continue
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      if (data?.publicUrl) {
        uploaded.push(data.publicUrl)
      }
    }

    setImageUrls((prev) => [...prev, ...uploaded])
    setUploading(false)
  }

  // ─── Remove Uploaded Image ─────────────────────────────────────────────────
  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── Form Submit ───────────────────────────────────────────────────────────
  async function handleSubmit(formData: FormData) {
    const manualList = manualUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean)

    const allImages = [...imageUrls, ...manualList]
    formData.set('images', allImages.join('\n'))

    await addProduct(formData)

    // ─── Reset after submit ────────────────────────────────────────────────
    setImageUrls([])
    setManualUrls('')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Add New Product</h1>
          <p className="text-gray-400 mt-1">Fill in the details below to list a new item</p>
        </div>

        <form action={handleSubmit} className="space-y-6">

          {/* Vinted Item ID */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">
              Vinted Item ID <span className="text-purple-400">*</span>
            </label>
            <input
              name="vinted_id"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition font-mono tracking-widest"
              placeholder="e.g. 9221330612"
            />
            <p className="text-xs text-gray-500 mt-1">
              📌 The numeric ID from the Vinted URL — used to identify this exact listing
            </p>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">
              Seller Description <span className="text-purple-400">*</span>
            </label>
            <input
              name="title"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="e.g. Garmin HRM-Pro Heart Rate Strap"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none"
              placeholder="Product description..."
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-200">
                Selling Price (EGP) <span className="text-purple-400">*</span>
              </label>
              <input
                name="price"
                type="number"
                required
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                placeholder="2999"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-200">Original Price (EUR)</label>
              <input
                name="original_price"
                type="number"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                placeholder="99.99"
              />
            </div>
          </div>

          {/* Brand & Size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-200">Brand</label>
              <input
                name="brand"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                placeholder="e.g. Garmin, Polar, Wahoo..."
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-200">Size / Model</label>
              <input
                name="size"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                placeholder="e.g. HRM-Pro, Forerunner 965..."
              />
            </div>
          </div>

          {/* Condition & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-200">
                Condition <span className="text-purple-400">*</span>
              </label>
              <select
                name="condition"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              >
                <option value="">Select...</option>
                <option value="New with tags">New with tags</option>
                <option value="New without tags">New without tags</option>
                <option value="Very good">Very good</option>
                <option value="Good">Good</option>
                <option value="Satisfactory">Satisfactory</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-200">Category</label>
              <select
                name="category"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              >
                <option value="">Select...</option>
                <option value="Fitness Watches">Fitness Watches</option>
                <option value="Heart Rate Straps">Heart Rate Straps</option>
                <option value="Replacement Straps">Replacement Straps</option>
                <option value="Running Accessories">Running Accessories</option>
                <option value="Cycling Accessories">Cycling Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Allow Reservation */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">
              Allow Reservation? <span className="text-purple-400">*</span>
            </label>
            <select
              name="is_reservable"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            >
              <option value="true">✅ Yes — Can be reserved</option>
              <option value="false">🚫 No — Cannot be reserved</option>
            </select>
          </div>

          {/* Source URL */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">Source URL</label>
            <input
              name="source_url"
              type="url"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              placeholder="https://www.vinted.com/items/..."
            />
          </div>

          {/* ===== IMAGE UPLOAD + URLs ===== */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-200">
              Product Images
            </label>

            {/* Upload Button */}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-purple-500 transition bg-gray-800/50">
              <span className="text-3xl mb-1">📁</span>
              <span className="text-sm text-gray-400">
                {uploading ? '⏳ Uploading...' : 'Click to upload images from device'}
              </span>
              <span className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP supported</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-xs text-gray-500 uppercase tracking-widest">or paste URLs</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            {/* Manual URL Input */}
            <textarea
              rows={3}
              placeholder={"https://www.vinted.com/photos/...\nhttps://www.vinted.com/photos/..."}
              value={manualUrls}
              onChange={(e) => setManualUrls(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none text-sm font-mono"
            />
            <p className="text-xs text-gray-500">
              📌 One URL per line — paste Vinted image links here
            </p>

            {/* Uploaded Image Previews */}
            {imageUrls.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">
                  📁 Uploaded from device ({imageUrls.length})
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {imageUrls.map((url, i) => (
                    <div
                      key={i}
                      className="relative group rounded-xl overflow-hidden border border-gray-700"
                    >
                      <img
                        src={url}
                        alt={`Uploaded ${i + 1}`}
                        className="w-full h-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition text-lg"
          >
            ➕ Add Product
          </button>

        </form>
      </div>
    </div>
  )
}