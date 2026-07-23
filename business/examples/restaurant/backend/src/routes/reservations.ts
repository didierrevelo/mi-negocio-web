// ============================================
// RUTAS: RESERVACIONES (LA CUCINA)
// ============================================
// Gestión de reservaciones de mesas
// GET /     → Listar (con filtros: date, status)
// GET /:id  → Obtener una
// POST /    → Crear reservación
// PUT /:id/status → Actualizar estado
// DELETE /:id → Cancelar
// Conecta: Con models/Reservation.ts

import express from 'express';
const router = express.Router();
import Reservation from '../models/Reservation';

// ============================================
// GET /api/reservations
// ============================================
// Qué: Lista reservaciones con filtros opcionales
// Filtros: date (fecha específica), status (estado)
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const { date, status } = req.query;
        let query: any = {};
        
        // Filtro por fecha
        if (date) {
            query.date = new Date(date as string);
        }
        // Filtro por estado
        if (status) {
            query.status = status;
        }
        
        // Ordena por fecha y hora
        const reservations = await Reservation.find(query).sort({ date: 1, time: 1 });
        res.json(reservations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// GET /api/reservations/:id
// ============================================
// Qué: Obtiene una reservación por ID
router.get('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservación no encontrada' });
        }
        res.json(reservation);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// POST /api/reservations
// ============================================
// Qué: Crea una nueva reservación
// Body: { name, email, phone, date, time, guests, notes }
router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const reservation = new Reservation(req.body);
        await reservation.save();
        res.status(201).json(reservation);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// PUT /api/reservations/:id/status
// ============================================
// Qué: Actualiza el estado de una reservación
// Estados: pending → confirmed | cancelled
router.put('/:id/status', async (req: express.Request, res: express.Response) => {
    try {
        const { status } = req.body;
        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!reservation) {
            return res.status(404).json({ error: 'Reservación no encontrada' });
        }
        res.json(reservation);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ============================================
// DELETE /api/reservations/:id
// ============================================
// Qué: Cancela una reservación (elimina)
router.delete('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservación no encontrada' });
        }
        res.json({ message: 'Reservación cancelada' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
