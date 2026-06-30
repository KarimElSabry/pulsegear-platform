export type ProductCondition =
  | 'New with tags'
  | 'New without tags'
  | 'Very good'
  | 'Good'
  | 'Satisfactory';

export type ProductSource = 'vinted' | 'amazon' | 'manual';
export type ProductStatus = 'available' | 'sold';

export interface ProductImage {
  id?: number;
  product_id?: number;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id?: number;
  title: string;
  slug?: string;
  brand?: string;
  category?: string;
  condition?: ProductCondition;
  price_egp: number;
  description?: string;
  source?: ProductSource;
  source_url?: string;
  status?: ProductStatus;
  featured?: boolean;
  created_at?: string;
  sold_at?: string | null; 
  images?: ProductImage[];
}

export interface VintedParseResult {
  success: boolean;
  product?: Omit<Product, 'id' | 'created_at'>;
  images?: string[];
  error?: string;
}

// ✅ أضفناهم هنا
export interface ProductFilters {
  brand?: string;
  category?: string;
  status?: ProductStatus;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}