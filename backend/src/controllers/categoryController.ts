// ============================================
// Controlador de Categorías
// ============================================

import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { CreateCategoryDTO } from '../types';
import { createError } from '../middleware/errorHandler';

// GET /api/categories
export const getAllCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.created_at,
        COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name, c.description, c.created_at
      ORDER BY c.name ASC
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return next(createError('Categoría no encontrada', 404));
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description }: CreateCategoryDTO = req.body;

    if (!name || name.trim() === '') {
      return next(createError('El nombre de la categoría es requerido', 400));
    }

    const result = await pool.query(
      `INSERT INTO categories (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), description?.trim() || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Categoría creada exitosamente',
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return next(createError('Ya existe una categoría con ese nombre', 409));
    }
    next(error);
  }
};

// PUT /api/categories/:id
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description }: Partial<CreateCategoryDTO> = req.body;

    if (!name || name.trim() === '') {
      return next(createError('El nombre de la categoría es requerido', 400));
    }

    const result = await pool.query(
      `UPDATE categories
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      [name.trim(), description?.trim() || null, id]
    );

    if (result.rows.length === 0) {
      return next(createError('Categoría no encontrada', 404));
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Categoría actualizada exitosamente',
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return next(createError('Ya existe una categoría con ese nombre', 409));
    }
    next(error);
  }
};

// DELETE /api/categories/:id
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Verificar si tiene productos
    const productCheck = await pool.query(
      'SELECT COUNT(*)::int AS count FROM products WHERE category_id = $1',
      [id]
    );

    if (productCheck.rows[0].count > 0) {
      return next(createError(
        `No se puede eliminar: esta categoría tiene ${productCheck.rows[0].count} producto(s) asociado(s)`,
        409
      ));
    }

    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return next(createError('Categoría no encontrada', 404));
    }

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};