// src/types/prodcuts.ts

// ─── Enums / Unions ───────────────────────────────────────────────────────────

export type ProductCondition =
  | 'New with tags'
  | 'New without tags'
  | 'Very good'
  | 'Good'
  | 'Satisfactory'

export type ProductSource   = 'vinted' | 'amazon' | 'manual'
export type ProductStatus   = 'available' | 'sold' | 'reserved' | 'out_of_stock'
export type ProductPlatform = 'vinted' | 'ebay' | 'amazon' | 'manual' | 'other'

// ─── Product Image ────────────────────────────────────────────────────────────

export interface ProductImage {
  id?:            number
  product_id?:    number
  image_url:      string
  is_primary:     boolean
  display_order:  number
}

// ─── Core Product ─────────────────────────────────────────────────────────────

export interface Product {
  // 🔑 Identity
  id?:               number
  slug?:             string

  // 📝 Basic Info
  title:             string
  description?:      string
  brand?:            string
  category?:         string
  size?:             string | null

  // 🔖 Reservation
  is_reservable:     boolean             // ✅ من الـ DB — true أو false

  // 💰 Pricing
  price_egp:         number
  original_price?:   number | null

  // 📦 Condition & Status
  condition?:        ProductCondition
  status?:           ProductStatus
  featured?:         boolean

  // 🔥 Deals
  is_deal?:          boolean            // ✅ NEW

  // 🔗 Source
  source?:           ProductSource
  source_url?:       string
  source_platform?:  ProductPlatform

  // 🕐 Timestamps
  created_at?:       string
  sold_at?:          string | null
  reserved_until?:   string | null

  // 🖼️ Relations
  images?:           ProductImage[]
}

// ─── Vinted Parser ────────────────────────────────────────────────────────────

export interface VintedParseResult {
  success:   boolean
  product?:  Omit<Product, 'id' | 'created_at'>
  images?:   string[]
  error?:    string
}

// ─── Filters & Pagination ─────────────────────────────────────────────────────

export interface ProductFilters {
  brand?:     string
  category?:  string
  status?:    ProductStatus
  featured?:  boolean
  is_deal?:   boolean                   // ✅ NEW
  search?:    string
  page?:      number
  limit?:     number
}

export interface PaginatedProducts {
  data:     Product[]
  total:    number
  page:     number
  limit:    number
  hasMore:  boolean
}