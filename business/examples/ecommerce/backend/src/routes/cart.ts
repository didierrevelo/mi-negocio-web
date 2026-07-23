import express from 'express';
const router = express.Router();

interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface Cart {
    items: CartItem[];
    total: number;
}

// In-memory cart (in production, use Redis or database)
const carts: Map<string, Cart> = new Map();

// GET /api/cart/:userId
router.get('/:userId', (req: express.Request, res: express.Response) => {
    const cart = carts.get(req.params.userId) || { items: [], total: 0 };
    res.json(cart);
});

// POST /api/cart/:userId/items
router.post('/:userId/items', (req: express.Request, res: express.Response) => {
    const { userId } = req.params;
    const { productId, name, price, image, quantity = 1 } = req.body;

    let cart = carts.get(userId) || { items: [], total: 0 };

    const existingItem = cart.items.find((item: CartItem) => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({ productId, name, price, image, quantity });
    }

    cart.total = cart.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
    carts.set(userId, cart);

    res.json(cart);
});

// PUT /api/cart/:userId/items/:productId
router.put('/:userId/items/:productId', (req: express.Request, res: express.Response) => {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    let cart = carts.get(userId);
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item: CartItem) => item.productId === productId);
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
    } else {
        cart.items[itemIndex].quantity = quantity;
    }

    cart.total = cart.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
    carts.set(userId, cart);

    res.json(cart);
});

// DELETE /api/cart/:userId/items/:productId
router.delete('/:userId/items/:productId', (req: express.Request, res: express.Response) => {
    const { userId, productId } = req.params;

    let cart = carts.get(userId);
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter((item: CartItem) => item.productId !== productId);
    cart.total = cart.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
    carts.set(userId, cart);

    res.json(cart);
});

// DELETE /api/cart/:userId
router.delete('/:userId', (req: express.Request, res: express.Response) => {
    carts.delete(req.params.userId);
    res.json({ message: 'Cart cleared' });
});

module.exports = router;
