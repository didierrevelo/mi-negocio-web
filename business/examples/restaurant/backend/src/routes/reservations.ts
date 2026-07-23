import express from 'express';
const router = express.Router();
import Reservation from '../models/Reservation';

// GET /api/reservations
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const { date, status } = req.query;
        let query: any = {};
        
        if (date) {
            query.date = new Date(date as string);
        }
        if (status) {
            query.status = status;
        }
        
        const reservations = await Reservation.find(query).sort({ date: 1, time: 1 });
        res.json(reservations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reservations/:id
router.get('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/reservations
router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        res.status(201).json(reservation);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/reservations/:id/status
router.put('/:id/status', async (req: express.Request, res: express.Response) => {
    try {
        const { status } = req.body;
        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/reservations/:id
router.delete('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.json({ message: 'Reservation cancelled' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
