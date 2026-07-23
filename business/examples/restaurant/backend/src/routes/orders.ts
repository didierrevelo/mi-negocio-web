// ============================================
// RUTAS: PEDIDOS DEL RESTAURANTE (LA CUCINA)
// ============================================
// Gestión de pedidos (dine-in, takeout, delivery)
// GET /     → Listar todos
// GET /:id  → Obtener uno
// POST /    → Crear pedido
// PUT /:id/status → Actualizar estado
// NOTA: Pedidos in-memory (en memoria del servidor)
// En producción: Usar MongoDB
// Conecta: Con frontend/app.js (addToCart, updateCart)

// ============================================
// INTERFACES
// ============================================

// Item del pedido
interface OrderItem {
    menuItem: string;
    quantity: number;
    price: number;
}

// Pedido completo
interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'delivered';
    createdAt: Date;
}

// ============================================
// ALMACENAMIENTO EN MEMORIA
// ============================================
const orders: Map<string, Order> = new Map();

import express from 'express';
const router = express.Router();

// ============================================
// GET /api/orders
// ============================================
// Qué: Lista todos los pedidos
router.get('/', (req: express.Request, res: express.Response) => {
    const allOrders = Array.from(orders.values());
    res.json(allOrders);
});

// ============================================
// GET /api/orders/:id
// ============================================
// Qué: Obtiene un pedido por ID
router.get('/:id', (req: express.Request, res: express.Response) => {
    const order = orders.get(req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(order);
});

// ============================================
// POST /api/orders
// ============================================
// Qué: Crea un nuevo pedido
// Body: { items, total }
router.post('/', (req: express.Request, res: express.Response) => {
    const { items, total } = req.body;
    const order: Order = {
        id: Date.now().toString(),  // ID único basado en timestamp
        items,
        total,
        status: 'pending',  // Estado inicial
        createdAt: new Date()
    };
    orders.set(order.id, order);
    res.status(201).json(order);
});

// ============================================
// PUT /api/orders/:id/status
// ============================================
// Qué: Actualiza el estado del pedido
// Estados: pending → preparing → ready → delivered
router.put('/:id/status', (req: express.Request, res: express.Response) => {
    const order = orders.get(req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    order.status = req.body.status;
    res.json(order);
});

module.exports = router;
