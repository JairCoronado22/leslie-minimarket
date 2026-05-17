import axios from 'axios';

// ── Tipos definidos aquí directamente ────────
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
export interface ProductFilters {
  search?: string;
  category_id?: number;
  low_stock?: boolean;
  page?: number;
  limit?: number;
}

// ── Cliente axios ─────────────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Error de conexión';
    return Promise.reject(new Error(message));
  }
);

// ── Dashboard ─────────────────────────────────
export const dashboardApi = {
  getStats: () =>
    api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats')
       .then(r => r.data.data),
};

// ── Categorías ────────────────────────────────
export const categoriesApi = {
  getAll: () =>
    api.get<{ success: boolean; data: Category[] }>('/categories')
       .then(r => r.data.data),
  create: (data: { name: string; description?: string }) =>
    api.post<{ success: boolean; data: Category; message: string }>('/categories', data)
       .then(r => r.data),
  update: (id: number, data: { name: string; description?: string }) =>
    api.put<{ success: boolean; data: Category; message: string }>(`/categories/${id}`, data)
       .then(r => r.data),
  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/categories/${id}`)
       .then(r => r.data),
};

// ── Productos ─────────────────────────────────
export const productsApi = {
  getAll: (filters?: ProductFilters) =>
    api.get<PaginatedResponse<Product>>('/products', { params: filters })
       .then(r => r.data),
  getById: (id: number) =>
    api.get<{ success: boolean; data: Product }>(`/products/${id}`)
       .then(r => r.data.data),
  create: (data: Partial<Product>) =>
    api.post<{ success: boolean; data: Product; message: string }>('/products', data)
       .then(r => r.data),
  update: (id: number, data: Partial<Product>) =>
    api.put<{ success: boolean; data: Product; message: string }>(`/products/${id}`, data)
       .then(r => r.data),
  delete: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/products/${id}`)
       .then(r => r.data),
  updateStock: (id: number, stock: number) =>
    api.patch<{ success: boolean; data: Product; message: string }>(`/products/${id}/stock`, { stock })
       .then(r => r.data),
};