// ============================================
// SERVIDOR PRINCIPAL - TECHSTORE
// ============================================
// Qué: API REST para tienda de tecnología
// Stack: Express + MongoDB + TypeScript
// Conecta: Con routes/products, routes/cart, routes/orders
// Puertos: 3000 (desarrollo), variable de entorno (producción)

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carga variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
// Conecta: Con models/Product.ts, models/Order.ts
// Producción: Usar variable de entorno MONGODB_URI
const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techstore');
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
// Products: CRUD de productos
app.use('/api/products', require('./routes/products'));
// Cart: Carrito de compras (in-memory)
app.use('/api/cart', require('./routes/cart'));
// Orders: Gestión de pedidos
app.use('/api/orders', require('./routes/orders'));

// ============================================
// HEALTH CHECK
// ============================================
// Qué: Endpoint para verificar que el servidor está activo
// Uso: Monitoreo, load balancers, UptimeRobot
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================
// MANEJO DE ERRORES
// ============================================
// Qué: Captura errores no manejados y retorna 500
// Seguridad: No expone detalles del error en producción
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: '¡Algo salió mal!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

export default app;
