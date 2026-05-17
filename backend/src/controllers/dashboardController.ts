// ============================================
// Controlador del Dashboard
// ============================================

import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';

// GET /api/dashboard/stats
export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [stats, lowStock, recentProducts] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int                          AS total_products,
          COUNT(*) FILTER (WHERE stock = 0)::int AS out_of_stock_count,
          COUNT(*) FILTER (WHERE stock > 0 AND stock <= min_stock)::int
                                                 AS low_stock_count,
          COALESCE(SUM(price * stock), 0)::float AS total_inventory_value,
          (SELECT COUNT(*)::int FROM categories)  AS total_categories
        FROM products
      `),

      pool.query(`
        SELECT p.id, p.name, p.stock, p.min_stock, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.stock <= p.min_stock
        ORDER BY p.stock ASC
        LIMIT 5
      `),

      pool.query(`
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 5
      `),
    ]);

    res.json({
      success: true,
      data: {
        ...stats.rows[0],
        low_stock_products: lowStock.rows,
        recent_products:    recentProducts.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};