// ============================================
// Barra lateral de navegación
// ============================================

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/products',    icon: Package,         label: 'Productos'   },
  { to: '/categories',  icon: Tag,             label: 'Categorías'  },
];

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-leslie-900 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-leslie-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-leslie-600 rounded-xl flex items-center justify-center">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg font-display leading-none">Leslie</h1>
            <p className="text-leslie-400 text-xs font-body">Minimarket</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-leslie-500 text-xs font-medium uppercase tracking-wider px-3 mb-3 font-display">
          Menú principal
        </p>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl
              font-medium text-sm transition-all duration-200 font-body
              ${isActive
                ? 'bg-leslie-700 text-white shadow-lg shadow-leslie-900/50'
                : 'text-leslie-300 hover:bg-leslie-800 hover:text-white'
              }
            `}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-leslie-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <TrendingUp size={16} className="text-leslie-400" />
          <div>
            <p className="text-leslie-300 text-xs font-body">Sistema de gestión</p>
            <p className="text-leslie-500 text-xs font-body">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}