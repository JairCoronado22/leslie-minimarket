// ============================================
// Configuración principal de Express
// ============================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import categoryRoutes  from './routes/categoryRoutes';
import productRoutes   from './routes/productRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();

// ── Middlewares ──────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:  'ok',
    message: '🛒 Leslie Minimarket API funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ────────────────────────────────────
app.use('/api/categories',  categoryRoutes);
app.use('/api/products',    productRoutes);
app.use('/api/dashboard',   dashboardRoutes);

// ── Manejo de errores ────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;