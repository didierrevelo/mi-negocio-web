// ============================================
// RUTAS: PEDIDOS (TECHSTORE)
// ============================================
// Gestión de pedidos de la tienda
// GET /     → Listar todos
// GET /:id  → Obtener uno
// POST /    → Crear pedido
// PUT /:id/status → Actualizar estado
// Conecta: Con models/Order.ts

import express from 'express';
const router = express.Router();
import Order from '../models/Order';

// ============================================
// GET /api/orders
// ============================================
// Qué: Lista todos los pedidos (con populate de usuario y productos)
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });  // Más recientes primero
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// GET /api/orders/:id
// ============================================
// Qué: Obtiene un pedido por ID
router.get('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name price image');
        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/orders
// ============================================
// Qué: Crea un nuevo pedido
// Body: { user, items, total, shippingAddress, paymentMethod }
router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// PUT /api/orders/:id/status
// ============================================
// Qué: Actualiza el estado de un pedido
// Estados: pending → processing → shipped → delivered | cancelled
router.put('/:id/status', async (req: express.Request, res: express.Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        res.json(order);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
