// ============================================
// Tipos compartidos del backend
// ============================================

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  min_stock: number;
  category_id: number | null;
  category_name?: string;
  image_url: string | null;
  barcode: string | null;
  unit: string;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  product_count?: number;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  stock: number;
  min_stock?: number;
  category_id?: number;
  image_url?: string;
  barcode?: string;
  unit?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export interface DashboardStats {
  total_products: number;
  total_categories: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_inventory_value: number;
  recent_products: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}