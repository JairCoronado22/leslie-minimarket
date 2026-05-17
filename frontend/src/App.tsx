// ============================================
// App principal con routing
// ============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar    from './components/Layout/Sidebar';
import Dashboard  from './pages/Dashboard';
import Products   from './pages/Products';
import Categories from './pages/Categories';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar fija */}
        <Sidebar />

        {/* Contenido principal */}
        <main className="flex-1 ml-64 min-h-screen">
          <div className="max-w-7xl mx-auto p-8">
            <Routes>
              <Route path="/"            element={<Dashboard />}  />
              <Route path="/products"    element={<Products />}   />
              <Route path="/categories"  element={<Categories />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}