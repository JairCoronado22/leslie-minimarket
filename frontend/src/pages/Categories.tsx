// ============================================
// Página de Categorías
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Tag, Package, AlertTriangle } from 'lucide-react';
import { categoriesApi } from '../services/api';
import type { Category } from '../services/api';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Header from '../components/Layout/Header';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [formLoad,   setFormLoad]   = useState(false);
  const [delLoad,    setDelLoad]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [showDel,    setShowDel]    = useState(false);
  const [selected,   setSelected]   = useState<Category | null>(null);
  const [form,       setForm]       = useState({ name: '', description: '' });
  const [formError,  setFormError]  = useState('');

  const showMsg = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else         setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3500);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openForm = (cat?: Category) => {
    setSelected(cat || null);
    setForm(cat
      ? { name: cat.name, description: cat.description || '' }
      : { name: '', description: '' }
    );
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('El nombre es requerido'); return; }

    try {
      setFormLoad(true);
      if (selected) {
        await categoriesApi.update(selected.id, form);
        showMsg('Categoría actualizada');
      } else {
        await categoriesApi.create(form);
        showMsg('Categoría creada');
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoad(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setDelLoad(true);
      await categoriesApi.delete(selected.id);
      showMsg('Categoría eliminada');
      setShowDel(false);
      setSelected(null);
      load();
    } catch (err: any) {
      showMsg(err.message, true);
    } finally {
      setDelLoad(false);
    }
  };

  const COLORS = [
    'bg-leslie-100 text-leslie-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
  ];

  return (
    <div className="animate-fade-in">
      <Header
        title="Categorías"
        subtitle={`${categories.length} categorías registradas`}
        actions={
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                       bg-leslie-700 text-white font-medium text-sm
                       hover:bg-leslie-800 active:scale-95
                       transition-all duration-200 font-display shadow-lg shadow-leslie-900/20"
          >
            <Plus size={18} />
            Nueva categoría
          </button>
        }
      />

      {/* Notificaciones */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl
                        text-green-800 text-sm font-body animate-slide-up flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
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

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-leslie-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm
                         hover:shadow-md hover:-translate-y-0.5
                         transition-all duration-300 p-5 animate-slide-up"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                  <Tag size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 font-display truncate">{cat.name}</h3>
                  <p className="text-sm text-gray-400 font-body mt-0.5 line-clamp-2">
                    {cat.description || 'Sin descripción'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-body">
                  <Package size={14} />
                  <span>
                    <span className="font-semibold text-gray-900">{cat.product_count}</span>
                    {' '}producto{cat.product_count !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openForm(cat)}
                    className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100
                               transition-all duration-200"
                    title="Editar"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => { setSelected(cat); setShowDel(true); }}
                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100
                               transition-all duration-200"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Crear/Editar categoría */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setSelected(null); }}
        title={selected ? `Editar: ${selected.name}` : 'Nueva Categoría'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 font-display">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormError(''); }}
              placeholder="Ej: Bebidas"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-body
                          focus:outline-none focus:ring-2 focus:ring-leslie-600/20 focus:border-leslie-600
                          transition-all ${formError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
            />
            {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 font-display">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Descripción de la categoría..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                         font-body resize-none focus:outline-none focus:ring-2
                         focus:ring-leslie-600/20 focus:border-leslie-600 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setSelected(null); }}
              disabled={formLoad}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200
                         text-gray-700 font-medium hover:bg-gray-50 transition-all font-display"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formLoad}
              className="flex-1 px-4 py-2.5 rounded-xl bg-leslie-700 text-white
                         font-medium hover:bg-leslie-800 transition-all font-display
                         disabled:opacity-50"
            >
              {formLoad ? 'Guardando...' : (selected ? 'Guardar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirmar eliminar */}
      <ConfirmDialog
        isOpen={showDel}
        onClose={() => { setShowDel(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Eliminar categoría"
        message={`¿Eliminar "${selected?.name}"? Los productos de esta categoría quedarán sin categoría.`}
        loading={delLoad}
      />
    </div>
  );
}