import mongoose, { Document, Schema } from 'mongoose';

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

const reservationSchema = new Schema<IReservation>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        guests: {
            type: Number,
            required: true,
            min: 1,
            max: 20
        },
        notes: {
            type: String
        },
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
