export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  min_stock: number;
  category_id: number | null;
  category_name: string | null;
  image_url: string | null;
  barcode: string | null;
  unit: string;
  created_at: string;
  updated_at: string;
}
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  product_count: number;
}
export interface DashboardStats {
  total_products: number;
  total_categories: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_inventory_value: number;
  low_stock_products: Product[];
  recent_products: Product[];
}
export interface ProductFormData {
  name: string;
  description: string;
  price: number | '';
  stock: number | '';
  min_stock: number | '';
  category_id: number | '';
  image_url: string;
  barcode: string;
  unit: string;
}
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
