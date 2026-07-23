// ============================================
// MODELO: PEDIDO (TECHSTORE)
// ============================================
// Qué: Define la estructura de un pedido de la tienda
// Estados: pending → processing → shipped → delivered | cancelled
// Estados pago: pending → completed | failed | refunded
// Conecta: Con routes/orders.ts (CRUD), con frontend/app.js

import mongoose, { Document, Schema } from 'mongoose';

// ============================================
// INTERFAZ: IOrderItem
// ============================================
// Qué: Define un item dentro del pedido
export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

// ============================================
// INTERFAZ: IOrder
// ============================================
// Qué: Define el pedido completo
export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    items: IOrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    paymentMethod: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// SCHEMA: orderSchema
// ============================================
// Qué: Define la estructura MongoDB del pedido
const orderSchema = new Schema<IOrder>(
    {
        // Usuario que hizo el pedido
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        // Items del pedido (productos + cantidad + precio)
        items: [{
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true }
        }],
        // Total del pedido
        total: {
            type: Number,
            required: true
        },
        // Estado del pedido
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        // Dirección de envío
        shippingAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        // Método de pago (tarjeta, PayPal, etc.)
        paymentMethod: {
            type: String,
            required: true
        },
        // Estado del pago
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IOrder>('Order', orderSchema);
