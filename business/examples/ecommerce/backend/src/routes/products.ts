import express from 'express';
const router = express.Router();
import Product, { IProduct } from '../models/Product';

// GET /api/products
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const { category, sort, search, featured } = req.query;
        let query: any = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (featured === 'true') {
            query.featured = true;
        }

        if (search) {
            query.$text = { $search: search as string };
        }

        let sortOption: any = {};
        switch (sort) {
            case 'price-low':
                sortOption = { price: 1 };
                break;
            case 'price-high':
                sortOption = { price: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            default:
                sortOption = { featured: -1, createdAt: -1 };
        }

        const products = await Product.find(query).sort(sortOption);
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/products/:id
router.get('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/products
router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/products/:id
router.put('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/products/:id
router.delete('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
