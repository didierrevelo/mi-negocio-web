// ============================================
// RUTAS: CARRITO DE COMPRAS (TECHSTORE)
// ============================================
// Gestión del carrito por usuario
// NOTA: Carrito in-memory (en memoria del servidor)
// En producción: Usar Redis o base de datos
// Conecta: Con frontend/app.js (addToCart, updateCart)
// Puertos: 3000

// ============================================
// INTERFACES
// ============================================

// Item del carrito
interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

// Carrito completo
interface Cart {
    items: CartItem[];
    total: number;
}

// ============================================
// ALMACENAMIENTO EN MEMORIA
// ============================================
// NOTA: Se pierde al reiniciar el servidor
// En producción: Usar Redis o MongoDB
const carts: Map<string, Cart> = new Map();

import express from 'express';
const router = express.Router();

// ============================================
// GET /api/cart/:userId
// ============================================
// Qué: Obtiene el carrito de un usuario
router.get('/:userId', (req: express.Request, res: express.Response) => {
    const cart = carts.get(req.params.userId) || { items: [], total: 0 };
    res.json(cart);
});

// ============================================
// POST /api/cart/:userId/items
// ============================================
// Qué: Agrega un item al carrito
// Body: { productId, name, price, image, quantity }
// Si el item ya existe, incrementa la cantidad
router.post('/:userId/items', (req: express.Request, res: express.Response) => {
    const { userId } = req.params;
    const { productId, name, price, image, quantity = 1 } = req.body;

    let cart = carts.get(userId) || { items: [], total: 0 };

    // Verifica si el item ya está en el carrito
    const existingItem = cart.items.find((item: CartItem) => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += quantity;  // Incrementa cantidad
    } else {
        cart.items.push({ productId, name, price, image, quantity });  // Agrega nuevo
    }

    // Recalcula total
    cart.total = cart.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
    carts.set(userId, cart);

    res.json(cart);
});

// ============================================
// PUT /api/cart/:userId/items/:productId
// ============================================
// Qué: Actualiza la cantidad de un item
// Body: { quantity }
// Si quantity <= 0, elimina el item
router.put('/:userId/items/:productId', (req: express.Request, res: express.Response) => {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    let cart = carts.get(userId);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const itemIndex = cart.items.findIndex((item: CartItem) => item.productId === productId);
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item no encontrado en el carrito' });
    }

    if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);  // Elimina item
    } else {
        cart.items[itemIndex].quantity = quantity;  // Actualiza cantidad
    }

    // Recalcula total
    cart.total = cart.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
    carts.set(userId, cart);

    res.json(cart);
});

// ============================================
// DELETE /api/cart/:userId/items/:productId
// ============================================
// Qué: Elimina un item específico del carrito
router.delete('/:userId/items/:productId', (req: express.Request, res: express.Response) => {
    const { userId, productId } = req.params;

    let cart = carts.get(userId);
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Filtra el item a eliminar
    cart.items = cart.items.filter((item: CartItem) => item.productId !== productId);
    cart.total = cart.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
    carts.set(userId, cart);

    res.json(cart);
});

// ============================================
// DELETE /api/cart/:userId
// ============================================
// Qué: Vacía todo el carrito del usuario
router.delete('/:userId', (req: express.Request, res: express.Response) => {
    carts.delete(req.params.userId);
    res.json({ message: 'Carrito vaciado' });
});

module.exports = router;
