// ============================================
// Controlador de Productos
// ============================================

import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { CreateProductDTO, UpdateProductDTO } from '../types';
import { createError } from '../middleware/errorHandler';

// GET /api/products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search = '',
      category_id,
      low_stock,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const offset   = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: any[]         = [];
    let   paramIdx              = 1;

    if (search) {
      conditions.push(`(
        p.name      ILIKE $${paramIdx} OR
        p.barcode   ILIKE $${paramIdx} OR
        p.description ILIKE $${paramIdx}
      )`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    if (category_id) {
      conditions.push(`p.category_id = $${paramIdx}`);
      params.push(parseInt(category_id as string));
      paramIdx++;
    }

    if (low_stock === 'true') {
      conditions.push(`p.stock <= p.min_stock`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;

    const dataQuery = `
      SELECT
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.name ASC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(dataQuery, [...params, limitNum, offset]),
    ]);

    const total      = countResult.rows[0].total;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data:        dataResult.rows,
      total,
      page:        pageNum,
      limit:       limitNum,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return next(createError('Producto no encontrado', 404));
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// POST /api/products
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      min_stock = 5,
      category_id,
      image_url,
      barcode,
      unit = 'unidad',
    }: CreateProductDTO = req.body;

    // Validaciones
    if (!name || name.trim() === '') {
      return next(createError('El nombre del producto es requerido', 400));
    }
    if (price === undefined || price < 0) {
      return next(createError('El precio debe ser un valor positivo', 400));
    }
    if (stock === undefined || stock < 0) {
      return next(createError('El stock no puede ser negativo', 400));
    }

    const result = await pool.query(
      `INSERT INTO products
         (name, description, price, stock, min_stock, category_id, image_url, barcode, unit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        name.trim(),
        description?.trim() || null,
        price,
        stock,
        min_stock,
        category_id  || null,
        image_url    || null,
        barcode?.trim() || null,
        unit,
      ]
    );

    res.status(201).json({
      success: true,
      data:    result.rows[0],
      message: 'Producto creado exitosamente',
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return next(createError('Ya existe un producto con ese código de barras', 409));
    }
    next(error);
  }
};

// PUT /api/products/:id
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock,
      min_stock,
      category_id,
      image_url,
      barcode,
      unit,
    }: UpdateProductDTO = req.body;

    // Verificar que existe
    const exists = await pool.query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );
    if (exists.rows.length === 0) {
      return next(createError('Producto no encontrado', 404));
    }

    const result = await pool.query(
      `UPDATE products SET
        name        = COALESCE($1, name),
        description = COALESCE($2, description),
        price       = COALESCE($3, price),
        stock       = COALESCE($4, stock),
        min_stock   = COALESCE($5, min_stock),
        category_id = COALESCE($6, category_id),
        image_url   = COALESCE($7, image_url),
        barcode     = COALESCE($8, barcode),
        unit        = COALESCE($9, unit)
       WHERE id = $10
       RETURNING *`,
      [
        name?.trim()        || null,
        description?.trim() || null,
        price               ?? null,
        stock               ?? null,
        min_stock           ?? null,
        category_id         ?? null,
        image_url           || null,
        barcode?.trim()     || null,
        unit                || null,
        id,
      ]
    );

    res.json({
      success: true,
      data:    result.rows[0],
      message: 'Producto actualizado exitosamente',
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return next(createError('Ya existe un producto con ese código de barras', 409));
    }
    next(error);
  }
};

// DELETE /api/products/:id
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return next(createError('Producto no encontrado', 404));
    }

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/products/:id/stock — Ajuste rápido de stock
export const updateStock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id }  = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return next(createError('El stock debe ser un número positivo', 400));
    }

    const result = await pool.query(
      `UPDATE products SET stock = $1 WHERE id = $2 RETURNING *`,
      [stock, id]
    );

    if (result.rows.length === 0) {
      return next(createError('Producto no encontrado', 404));
    }

    res.json({
      success: true,
      data:    result.rows[0],
      message: 'Stock actualizado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};