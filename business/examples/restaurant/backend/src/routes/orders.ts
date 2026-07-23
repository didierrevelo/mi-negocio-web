import express from 'express';
const router = express.Router();

interface OrderItem {
    menuItem: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'delivered';
    createdAt: Date;
}

// In-memory orders
const orders: Map<string, Order> = new Map();

// GET /api/orders
router.get('/', (req: express.Request, res: express.Response) => {
    const allOrders = Array.from(orders.values());
    res.json(allOrders);
});

// GET /api/orders/:id
router.get('/:id', (req: express.Request, res: express.Response) => {
    const order = orders.get(req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
});

// POST /api/orders
router.post('/', (req: express.Request, res: express.Response) => {
    const { items, total } = req.body;
    const order: Order = {
        id: Date.now().toString(),
        items,
        total,
        status: 'pending',
        createdAt: new Date()
    };
    orders.set(order.id, order);
    res.status(201).json(order);
});

// PUT /api/orders/:id/status
router.put('/:id/status', (req: express.Request, res: express.Response) => {
    const order = orders.get(req.params.id);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    order.status = req.body.status;
    res.json(order);
});

module.exports = router;
