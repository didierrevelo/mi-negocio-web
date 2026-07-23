// ============================================
// SERVIDOR PRINCIPAL - LA CUCINA (RESTAURANTE)
// ============================================
// Qué: API REST para restaurante italiano
// Stack: Express + MongoDB + TypeScript
// Conecta: Con routes/menu, routes/reservations, routes/orders
// Puertos: 3001 (desarrollo), variable de entorno (producción)

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carga variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================
// CORS: Permite requests desde el frontend
app.use(cors());
// JSON: Parsea body de requests
app.use(express.json());

// ============================================
// CONEXIÓN A MONGODB
// ============================================
// Qué: Conecta a la base de datos MongoDB
// Conecta: Con models/MenuItem.ts, models/Reservation.ts
const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lacucina');
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error de conexión a MongoDB:', error);
        process.exit(1);
    }
};

connectDB();

// ============================================
// RUTAS
// ============================================
// Menu: CRUD del menú del restaurante
app.use('/api/menu', require('./routes/menu'));
// Reservations: Gestión de reservaciones
app.use('/api/reservations', require('./routes/reservations'));
// Orders: Pedidos del restaurante
app.use('/api/orders', require('./routes/orders'));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================
// MANEJO DE ERRORES
// ============================================
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: '¡Algo salió mal!' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

export default app;
