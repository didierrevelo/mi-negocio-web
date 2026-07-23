import express from 'express';
const router = express.Router();
import Order from '../models/Order';

// GET /api/orders
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/orders/:id
router.get('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name price image');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/orders
router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/orders/:id/status
router.put('/:id/status', async (req: express.Request, res: express.Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
