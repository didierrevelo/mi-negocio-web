import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
    name: string;
    description: string;
    price: number;
    category: 'entradas' | 'pasta' | 'pizzas' | 'carnes' | 'postres' | 'bebidas';
    image: string;
    tags: string[];
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: String,
            required: true,
            enum: ['entradas', 'pasta', 'pizzas', 'carnes', 'postres', 'bebidas']
        },
        image: {
            type: String,
            default: '🍽️'
        },
        tags: [{
            type: String
        }],
        available: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
