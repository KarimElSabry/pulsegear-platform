// src/app/admin/page.tsx

import { addProduct } from './actions'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Add New Product</h1>
          <p className="text-gray-400 mt-1">Fill in the details below to list a new item</p>
        </div>

        <form action={addProduct} className="space-y-6">

          {/* ✅ Vinted Item ID — NEW FIELD */}
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
              Title <span className="text-purple-400">*</span>
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

          {/* Images */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-200">
              Image URLs{' '}
              <span className="text-gray-500 font-normal">(one per line)</span>
            </label>
            <textarea
              name="images"
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition resize-none"
              placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition text-lg"
          >
            ➕ Add Product
          </button>

        </form>
      </div>
    </div>
  )
}