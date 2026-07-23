// ============================================
// RUTAS: MENÚ (LA CUCINA)
// ============================================
// CRUD completo del menú del restaurante
// GET /     → Listar (con filtro por categoría)
// GET /:id  → Obtener uno
// POST /    → Crear plato
// PUT /:id  → Actualizar plato
// DELETE /:id → Eliminar plato
// Conecta: Con models/MenuItem.ts, con frontend/app.js

import express from 'express';
const router = express.Router();
import MenuItem from '../models/MenuItem';

// ============================================
// GET /api/menu
// ============================================
// Qué: Lista platos del menú (solo disponibles)
// Filtro: category (opcional)
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const { category } = req.query;
        let query: any = { available: true };  // Solo platos disponibles
        
        // Filtro por categoría
        if (category) {
            query.category = category;
        }
        
        // Ordena por categoría y nombre
        const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// GET /api/menu/:id
// ============================================
// Qué: Obtiene un plato por ID
router.get('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Plato no encontrado' });
        }
        res.json(item);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/menu
// ============================================
// Qué: Crea un nuevo plato
// Body: { name, description, price, category, image, tags }
router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const item = new MenuItem(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// PUT /api/menu/:id
// ============================================
// Qué: Actualiza un plato existente
router.put('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!item) {
            return res.status(404).json({ error: 'Plato no encontrado' });
        }
        res.json(item);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// DELETE /api/menu/:id
// ============================================
// Qué: Elimina un plato
router.delete('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Plato no encontrado' });
        }
        res.json({ message: 'Plato eliminado' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
