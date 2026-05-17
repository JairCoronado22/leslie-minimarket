// ============================================
// Página de Gestión de Productos
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Package, Edit2, Trash2,
  AlertTriangle, ChevronLeft, ChevronRight,
  Filter, X, BarChart2,
} from 'lucide-react';
import { productsApi, categoriesApi } from '../services/api';
import type { Product, Category, ProductFormData } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ProductForm from '../components/Products/ProductForm';
import Badge from '../components/ui/Badge';
import Header from '../components/Layout/Header';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // UI
  const [loading,     setLoading]     = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [delLoading,  setDelLoading]  = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');

  // Modals
  const [showForm,    setShowForm]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStock,   setShowStock]   = useState(false);
  const [selected,    setSelected]    = useState<Product | null>(null);
  const [newStock,    setNewStock]    = useState(0);

  // Filters
  const [search,      setSearch]      = useState(searchParams.get('search')     || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category_id') || '');
  const [lowStock,    setLowStock]    = useState(searchParams.get('low_stock')  === 'true');
  const [page,        setPage]        = useState(1);

  const LIMIT = 12;

  const showMessage = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else         setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3500);
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productsApi.getAll({
        search:      search   || undefined,
        category_id: categoryFilter ? parseInt(categoryFilter) : undefined,
        low_stock:   lowStock || undefined,
        page,
        limit: LIMIT,
      });
      setProducts(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, lowStock, page]);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await categoriesApi.getAll();
      setCategories(cats);
    } catch { /* silently */ }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Sincronizar searchParams cuando cambien los filtros
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search)         params.search      = search;
    if (categoryFilter) params.category_id = categoryFilter;
    if (lowStock)       params.low_stock   = 'true';
    setSearchParams(params, { replace: true });
  }, [search, categoryFilter, lowStock, setSearchParams]);

  // ── Acciones CRUD ─────────────────────────────────────────────────────────────

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      setFormLoading(true);
      const payload = {
        ...formData,
        price:       Number(formData.price),
        stock:       Number(formData.stock),
        min_stock:   Number(formData.min_stock),
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
      };

      if (selected) {
        await productsApi.update(selected.id, payload);
        showMessage('Producto actualizado exitosamente');
      } else {
        await productsApi.create(payload);
        showMessage('Producto creado exitosamente');
      }

      setShowForm(false);
      setSelected(null);
      loadProducts();
    } catch (err: any) {
      showMessage(err.message, true);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setDelLoading(true);
      await productsApi.delete(selected.id);
      showMessage('Producto eliminado exitosamente');
      setShowConfirm(false);
      setSelected(null);
      loadProducts();
    } catch (err: any) {
      showMessage(err.message, true);
    } finally {
      setDelLoading(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!selected) return;
    try {
      await productsApi.updateStock(selected.id, newStock);
      showMessage('Stock actualizado');
      setShowStock(false);
      setSelected(null);
      loadProducts();
    } catch (err: any) {
      showMessage(err.message, true);
    }
  };

  // ── Helpers de UI ─────────────────────────────────────────────────────────────

  const stockStatus = (p: Product): { badge: JSX.Element; bar: string; pct: number } => {
    const pct = p.min_stock > 0 ? Math.min((p.stock / (p.min_stock * 2)) * 100, 100) : 100;
    if (p.stock === 0) return {
      badge: <Badge variant="danger">Sin stock</Badge>,
      bar: 'bg-red-500',
      pct,
    };
    if (p.stock <= p.min_stock) return {
      badge: <Badge variant="warning">Stock bajo</Badge>,
      bar: 'bg-amber-500',
      pct,
    };
    return {
      badge: <Badge variant="success">En stock</Badge>,
      bar: 'bg-leslie-500',
      pct,
    };
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setLowStock(false);
    setPage(1);
  };

  const hasFilters = search || categoryFilter || lowStock;

  return (
    <div className="animate-fade-in">
      <Header
        title="Productos"
        subtitle={`${total} productos registrados`}
        actions={
          <button
            onClick={() => { setSelected(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                       bg-leslie-700 text-white font-medium text-sm
                       hover:bg-leslie-800 active:scale-95
                       transition-all duration-200 font-display shadow-lg shadow-leslie-900/20"
          >
            <Plus size={18} />
            Nuevo producto
          </button>
        }
      />

      {/* Notificaciones */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl
                        text-green-800 text-sm font-body animate-slide-up flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl
                        text-red-800 text-sm font-body animate-slide-up flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200
                         text-sm focus:outline-none focus:ring-2 focus:ring-leslie-600/20
                         focus:border-leslie-600 transition-all font-body"
            />
          </div>

          {/* Categoría */}
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-leslie-600/20
                       focus:border-leslie-600 bg-white text-gray-700 font-body"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock bajo toggle */}
          <button
            onClick={() => { setLowStock(!lowStock); setPage(1); }}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium
              transition-all duration-200 font-body
              ${lowStock
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <Filter size={14} />
            Stock bajo
          </button>

          {/* Limpiar */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm
                         text-gray-500 hover:text-gray-700 hover:bg-gray-100
                         transition-all duration-200 font-body"
            >
              <X size={14} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-leslie-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-display font-semibold">No se encontraron productos</p>
          <p className="text-gray-400 text-sm mt-1 font-body">
            {hasFilters ? 'Intenta con otros filtros' : 'Crea tu primer producto'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => {
            const { badge, bar, pct } = stockStatus(product);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm
                           hover:shadow-md hover:-translate-y-0.5
                           transition-all duration-300 animate-slide-up flex flex-col"
              >
                {/* Imagen */}
                <div className="h-32 bg-gray-50 rounded-t-2xl overflow-hidden flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Package size={36} className="text-gray-200" />
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug font-display line-clamp-2">
                      {product.name}
                    </h3>
                    {badge}
                  </div>

                  {product.category_name && (
                    <span className="text-xs text-gray-400 mb-2 font-body">
                      {product.category_name}
                    </span>
                  )}

                  <p className="text-2xl font-bold text-leslie-700 font-display mb-3">
                    S/ {Number(product.price).toFixed(2)}
                  </p>

                  {/* Stock bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1 font-body">
                      <span>Stock: <span className="font-semibold text-gray-700">{product.stock} {product.unit}</span></span>
                      <span>Mín: {product.min_stock}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${bar}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => { setSelected(product); setNewStock(product.stock); setShowStock(true); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                                 bg-leslie-50 text-leslie-700 hover:bg-leslie-100
                                 transition-all font-body font-medium"
                      title="Ajustar stock"
                    >
                      <BarChart2 size={13} /> Stock
                    </button>

                    <button
                      onClick={() => { setSelected(product); setShowForm(true); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                                 bg-blue-50 text-blue-700 hover:bg-blue-100
                                 transition-all font-body font-medium"
                    >
                      <Edit2 size={13} /> Editar
                    </button>

                    <button
                      onClick={() => { setSelected(product); setShowConfirm(true); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
                                 bg-red-50 text-red-600 hover:bg-red-100
                                 transition-all font-body font-medium ml-auto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-gray-200 text-gray-600
                       hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm text-gray-600 font-body px-3">
            Página <span className="font-semibold">{page}</span> de <span className="font-semibold">{totalPages}</span>
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-gray-200 text-gray-600
                       hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modal: Crear / Editar producto */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setSelected(null); }}
        title={selected ? `Editar: ${selected.name}` : 'Nuevo Producto'}
        size="lg"
      >
        <ProductForm
          product={selected}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setSelected(null); }}
          loading={formLoading}
        />
      </Modal>

      {/* Modal: Confirmar eliminar */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar "${selected?.name}"? Esta acción no se puede deshacer.`}
        loading={delLoading}
      />

      {/* Modal: Ajustar stock */}
      <Modal
        isOpen={showStock}
        onClose={() => { setShowStock(false); setSelected(null); }}
        title={`Ajustar stock: ${selected?.name}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-leslie-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 font-body">Stock actual</p>
            <p className="text-4xl font-bold text-leslie-700 font-display">{selected?.stock}</p>
            <p className="text-sm text-gray-400 font-body">{selected?.unit}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 font-display">
              Nuevo stock
            </label>
            <input
              type="number"
              value={newStock}
              onChange={e => setNewStock(Number(e.target.value))}
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                         text-center text-xl font-bold font-display
                         focus:outline-none focus:ring-2 focus:ring-leslie-600/20
                         focus:border-leslie-600"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowStock(false); setSelected(null); }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200
                         text-gray-700 font-medium hover:bg-gray-50 transition-all font-display"
            >
              Cancelar
            </button>
            <button
              onClick={handleStockUpdate}
              className="flex-1 px-4 py-2.5 rounded-xl bg-leslie-700 text-white
                         font-medium hover:bg-leslie-800 transition-all font-display"
            >
              Actualizar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}