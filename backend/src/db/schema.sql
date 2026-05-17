-- ======================================
-- LESLIE MINIMARKET - Schema de Base de Datos
-- ======================================

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock    INTEGER NOT NULL DEFAULT 5,
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  image_url    TEXT,
  barcode      VARCHAR(50) UNIQUE,
  unit         VARCHAR(20) DEFAULT 'unidad',
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para productos
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================
-- DATOS INICIALES
-- ==================

INSERT INTO categories (name, description) VALUES
  ('Bebidas',    'Agua, jugos, gaseosas, energizantes'),
  ('Lácteos',    'Leche, yogurt, queso, mantequilla'),
  ('Panadería',  'Pan, pasteles, galletas, tortas'),
  ('Snacks',     'Papas, chifles, maní, palomitas'),
  ('Limpieza',   'Detergentes, lejía, escobas, trapeadores'),
  ('Abarrotes',  'Arroz, azúcar, aceite, fideos, lenteja'),
  ('Frutas',     'Frutas frescas de temporada'),
  ('Verduras',   'Verduras y hortalizas frescas'),
  ('Confitería', 'Caramelos, chocolates, chicles'),
  ('Higiene',    'Jabón, shampoo, pasta dental, desodorante')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, description, price, stock, min_stock, category_id, barcode, unit) VALUES
  ('Agua San Luis 625ml',    'Agua mineral sin gas',         1.50,  80,  20, 1, '7750110801018', 'botella'),
  ('Coca Cola 500ml',        'Bebida gaseosa cola',          3.50,  60,  15, 1, '7750110025014', 'botella'),
  ('Leche Gloria Entera 1L', 'Leche UHT entera caja',        4.80,  45,  10, 2, '7750110015015', 'caja'),
  ('Yogurt Gloria Fresa',    'Yogurt de fresa 200ml',        2.50,  30,  8,  2, '7750110015102', 'unidad'),
  ('Pan de Molde Bimbo',     'Pan de molde blanco grande',   8.50,  20,  5,  3, '7750110040018', 'paquete'),
  ('Galletas Casino',        'Galletas rellenas de vainilla',2.80,  50,  10, 3, '7750110012009', 'paquete'),
  ('Papas Lays 42g',         'Papas fritas sal y limón',     3.00,  70,  15, 4, '7750110022007', 'bolsa'),
  ('Chifles Inka',           'Chifles salados crujientes',   1.50,  90,  20, 4, '7750110022008', 'bolsa'),
  ('Arroz Paisana 5kg',      'Arroz extra calidad premium',  22.00, 35,  8,  6, '7750110060010', 'saco'),
  ('Aceite Primor 1L',       'Aceite vegetal de girasol',    12.50, 25,  6,  6, '7750110070011', 'botella'),
  ('Azúcar Rubia 1kg',       'Azúcar rubia natural',         5.50,  40,  10, 6, '7750110080012', 'bolsa'),
  ('Detergente Ariel 500g',  'Detergente en polvo flores',   12.00, 15,  5,  5, '7750110090013', 'bolsa'),
  ('Lejía Clorox 1L',        'Lejía desinfectante 1 litro',  6.50,  20,  6,  5, '7750110090014', 'botella'),
  ('Jabón Dove 90g',         'Jabón de baño hidratante',     3.80,  55,  12, 10,'7750110100015', 'unidad'),
  ('Chocolate Sublime',      'Chocolate con maní clásico',   2.00,  100, 25, 9, '7750110110016', 'unidad'),
  ('Fideo Don Vittorio 500g','Fideo cabello de ángel',       3.20,  4,   8,  6, '7750110120017', 'paquete'),
  ('Shampoo Head&Shoulders', 'Shampoo anticaspa 400ml',      22.00, 2,   5,  10,'7750110130018', 'botella'),
  ('Gaseosa Inca Kola 1.5L', 'Gaseosa inca kola litro y medio',8.00,3,  8,  1, '7750110025015', 'botella')
ON CONFLICT (barcode) DO NOTHING;psql -U postgres -d leslie_db -f src/db/schema.sql