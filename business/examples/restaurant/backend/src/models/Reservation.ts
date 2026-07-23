// ============================================
// MODELO: RESERVACIÓN (LA CUCINA)
// ============================================
// Qué: Define la estructura de una reservación de mesa
// Estados: pending → confirmed | cancelled
// Conecta: Con routes/reservations.ts (CRUD)

import mongoose, { Document, Schema } from 'mongoose';

// ============================================
// INTERFAZ: IReservation
// ============================================
export interface IReservation extends Document {
    name: string;
    email: string;
    phone: string;
    date: Date;
    time: string;
    guests: number;
    notes?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// SCHEMA: reservationSchema
// ============================================
const reservationSchema = new Schema<IReservation>(
    {
        // Nombre del cliente
        name: {
            type: String,
            required: true,
            trim: true
        },
        // Email del cliente
        email: {
            type: String,
            required: true,
            lowercase: true
        },
        // Teléfono del cliente
        phone: {
            type: String,
            required: true
        },
        // Fecha de la reservación
        date: {
            type: Date,
            required: true
        },
        // Hora de la reservación (formato: "19:00")
        time: {
            type: String,
            required: true
        },
        // Número de personas (1-20)
        guests: {
            type: Number,
            required: true,
            min: 1,
            max: 20
        },
        // Notas especiales (alergias, celebraciones, etc.)
        notes: {
            type: String
        },
        // Estado de la reservación
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IReservation>('Reservation', reservationSchema);
