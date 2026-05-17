// ============================================
// Formulario de Producto (Crear / Editar)
// ============================================

import { useState, useEffect } from 'react';
import type { Category, Product, ProductFormData } from '../../services/api';

interface ProductFormProps {
  product?:    Product | null;
  categories:  Category[];
  onSubmit:    (data: ProductFormData) => Promise<void>;
  onCancel:    () => void;
  loading?:    boolean;
}

const INITIAL_FORM: ProductFormData = {
  name:        '',
  description: '',
  price:       '',
  stock:       '',
  min_stock:   5,
  category_id: '',
  image_url:   '',
  barcode:     '',
  unit:        'unidad',
};

const UNITS = ['unidad', 'kg', 'litro', 'botella', 'caja', 'paquete', 'bolsa', 'saco', 'docena'];

export default function ProductForm({
  product,
  categories,
  onSubmit,
  onCancel,
  loading = false,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  useEffect(() => {
    if (product) {
      setForm({
        name:        product.name,
        description: product.description || '',
        price:       product.price,
        stock:       product.stock,
        min_stock:   product.min_stock,
        category_id: product.category_id || '',
        image_url:   product.image_url || '',
        barcode:     product.barcode || '',
        unit:        product.unit,
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [product]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!form.name.trim())
      newErrors.name = 'El nombre es requerido';
    if (form.price === '' || Number(form.price) < 0)
      newErrors.price = 'Ingresa un precio válido';
    if (form.stock === '' || Number(form.stock) < 0)
      newErrors.stock = 'El stock no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProductFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const inputClass = (field: keyof ProductFormData) => `
    w-full px-4 py-2.5 rounded-xl border
    text-gray-900 placeholder-gray-400 font-body text-sm
    focus:outline-none focus:ring-2 focus:ring-leslie-600/20 focus:border-leslie-600
    transition-all duration-200
    ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}
  `;

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5 font-display';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label className={labelClass}>Nombre del producto *</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ej: Coca Cola 500ml"
          className={inputClass('name')}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClass}>Descripción</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          placeholder="Descripción opcional del producto..."
          className={inputClass('description') + ' resize-none'}
        />
      </div>

      {/* Precio y Unidad */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Precio (S/) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">S/</span>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className={inputClass('price') + ' pl-9'}
            />
          </div>
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>

        <div>
          <label className={labelClass}>Unidad</label>
          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className={inputClass('unit')}
          >
            {UNITS.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock y Stock Mínimo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Stock actual *</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            min="0"
            placeholder="0"
            className={inputClass('stock')}
          />
          {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
        </div>

        <div>
          <label className={labelClass}>Stock mínimo</label>
          <input
            type="number"
            name="min_stock"
            value={form.min_stock}
            onChange={handleChange}
            min="0"
            placeholder="5"
            className={inputClass('min_stock')}
          />
        </div>
      </div>

      {/* Categoría */}
      <div>
        <label className={labelClass}>Categoría</label>
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className={inputClass('category_id')}
        >
          <option value="">Sin categoría</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Código de barras */}
      <div>
        <label className={labelClass}>Código de barras</label>
        <input
          type="text"
          name="barcode"
          value={form.barcode}
          onChange={handleChange}
          placeholder="Ej: 7750110801018"
          className={inputClass('barcode')}
        />
      </div>

      {/* URL Imagen */}
      <div>
        <label className={labelClass}>URL de imagen</label>
        <input
          type="url"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="https://ejemplo.com/imagen.jpg"
          className={inputClass('image_url')}
        />
      </div>

      {/* Preview imagen */}
      {form.image_url && (
        <div className="rounded-xl overflow-hidden border border-gray-200 h-32">
          <img
            src={form.image_url}
            alt="Preview"
            className="w-full h-full object-contain bg-gray-50"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200
                     text-gray-700 font-medium hover:bg-gray-50
                     transition-all duration-200 font-display"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl
                     bg-leslie-700 text-white font-medium
                     hover:bg-leslie-800 active:scale-95
                     transition-all duration-200 font-display
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? (product ? 'Guardando...' : 'Creando...')
            : (product ? 'Guardar cambios' : 'Crear producto')
          }
        </button>
      </div>
    </form>
  );
}