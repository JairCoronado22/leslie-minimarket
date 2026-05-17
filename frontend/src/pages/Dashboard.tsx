// ============================================
// Página Dashboard
// ============================================

import { useState, useEffect } from 'react';
import {
  Package, Tag, AlertTriangle, DollarSign,
  TrendingUp, ShoppingBag, Clock, ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import type { DashboardStats } from '../services/api';
import Badge from '../components/ui/Badge';
import Header from '../components/Layout/Header';

// ─── Tarjeta de estadística ────────────────────────────────────────────────────
interface StatCardProps {
  label:   string;
  value:   string | number;
  icon:    React.ReactNode;
  color:   string;
  subtext?: string;
}

function StatCard({ label, value, icon, color, subtext }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-body">{label}</p>
          <p className={`text-3xl font-bold font-display mt-1 ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1 font-body">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('700', '100').replace('600', '100').replace('800', '100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard principal ────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err: unknown) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-leslie-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
        <AlertTriangle className="mb-2" size={24} />
        <p className="font-medium">Error al cargar el dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const formatMoney = (v: number) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v);

  const stockBadge = (stock: number, minStock: number) => {
    if (stock === 0)        return <Badge variant="danger">Sin stock</Badge>;
    if (stock <= minStock)  return <Badge variant="warning">Stock bajo</Badge>;
    return                         <Badge variant="success">Normal</Badge>;
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Dashboard"
        subtitle="Resumen general del inventario de Leslie Minimarket"
        actions={
          <div className="flex items-center gap-2 text-sm text-gray-400 font-body">
            <Clock size={14} />
            {new Date().toLocaleDateString('es-PE', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Productos"
          value={stats.total_products}
          icon={<Package size={22} className="text-leslie-700" />}
          color="text-leslie-700"
          subtext="en inventario"
        />
        <StatCard
          label="Categorías"
          value={stats.total_categories}
          icon={<Tag size={22} className="text-blue-700" />}
          color="text-blue-700"
          subtext="activas"
        />
        <StatCard
          label="Stock Bajo"
          value={stats.low_stock_count + stats.out_of_stock_count}
          icon={<AlertTriangle size={22} className="text-amber-600" />}
          color="text-amber-600"
          subtext={`${stats.out_of_stock_count} sin stock`}
        />
        <StatCard
          label="Valor Inventario"
          value={formatMoney(stats.total_inventory_value)}
          icon={<DollarSign size={22} className="text-emerald-700" />}
          color="text-emerald-700"
          subtext="valor total"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Productos con stock bajo */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-semibold text-gray-900 font-display">
                Alertas de Stock
              </h3>
            </div>
            <button
              onClick={() => navigate('/products?low_stock=true')}
              className="text-sm text-leslie-700 hover:text-leslie-900 font-medium
                         flex items-center gap-1 transition-colors font-body"
            >
              Ver todos <ArrowRight size={14} />
            </button>
          </div>

          <div className="p-4 space-y-2">
            {stats.low_stock_products.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <TrendingUp size={32} className="mx-auto mb-2 text-leslie-300" />
                <p className="text-sm font-body">¡Todo el stock está bien!</p>
              </div>
            ) : (
              stats.low_stock_products.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl
                             bg-gray-50 hover:bg-amber-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate font-body">{p.name}</p>
                    <p className="text-xs text-gray-400 font-body">{p.category_name || 'Sin categoría'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-sm font-bold text-gray-700 font-display">{p.stock}</span>
                    {stockBadge(p.stock, p.min_stock)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Últimos productos agregados */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-leslie-600" />
              <h3 className="font-semibold text-gray-900 font-display">
                Últimos Productos
              </h3>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-sm text-leslie-700 hover:text-leslie-900 font-medium
                         flex items-center gap-1 transition-colors font-body"
            >
              Ver todos <ArrowRight size={14} />
            </button>
          </div>

          <div className="p-4 space-y-2">
            {stats.recent_products.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-xl
                           bg-gray-50 hover:bg-leslie-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-lg bg-leslie-100 flex items-center justify-center flex-shrink-0">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <Package size={18} className="text-leslie-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate font-body">{p.name}</p>
                  <p className="text-xs text-gray-400 font-body">{p.category_name || 'Sin categoría'}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-leslie-700 text-sm font-display">
                    S/ {Number(p.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 font-body">
                    {p.stock} {p.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}