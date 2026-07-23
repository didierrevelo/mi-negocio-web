// ============================================
// RUTAS: PRODUCTOS (TECHSTORE)
// ============================================
// CRUD completo de productos
// GET /     → Listar (con filtros: category, sort, search, featured)
// GET /:id  → Obtener uno
// POST /    → Crear
// PUT /:id  → Actualizar
// DELETE /:id → Eliminar
// Conecta: Con models/Product.ts, con frontend/app.js

import express from 'express';
const router = express.Router();
import Product, { IProduct } from '../models/Product';

// ============================================
// GET /api/products
// ============================================
// Qué: Lista productos con filtros opcionales
// Filtros: category, sort, search, featured
// Conecta: Con frontend/app.js (filterProducts)
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const { category, sort, search, featured } = req.query;
        let query: any = {};

        // Filtro por categoría
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filtro solo destacados
        if (featured === 'true') {
            query.featured = true;
        }

        // Búsqueda por texto (nombre o descripción)
        if (search) {
            query.$text = { $search: search as string };
        }

        // Ordenamiento
        let sortOption: any = {};
        switch (sort) {
            case 'price-low':
                sortOption = { price: 1 };  // Menor precio
                break;
            case 'price-high':
                sortOption = { price: -1 };  // Mayor precio
                break;
            case 'newest':
                sortOption = { createdAt: -1 };  // Más recientes
                break;
            default:
                sortOption = { featured: -1, createdAt: -1 };  // Destacados primero
        }

        const products = await Product.find(query).sort(sortOption);
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// GET /api/products/:id
// ============================================
// Qué: Obtiene un producto por ID
router.get('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/products
// ============================================
// Qué: Crea un nuevo producto
// Body: { name, description, price, category, image, stock, featured }
router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// PUT /api/products/:id
// ============================================
// Qué: Actualiza un producto existente
// Body: Campos a actualizar
router.put('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// DELETE /api/products/:id
// ============================================
// Qué: Elimina un producto
router.delete('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
