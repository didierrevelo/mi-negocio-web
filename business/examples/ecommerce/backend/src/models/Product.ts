import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    oldPrice?: number;
    category: 'laptops' | 'phones' | 'audio' | 'gaming' | 'accessories';
    image: string;
    stock: number;
    featured: boolean;
    ratings: {
        average: number;
        count: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
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
        oldPrice: {
            type: Number,
            min: 0
        },
        category: {
            type: String,
            required: true,
            enum: ['laptops', 'phones', 'audio', 'gaming', 'accessories']
        },
        image: {
            type: String,
            default: '📦'
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        featured: {
            type: Boolean,
            default: false
        },
        ratings: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 }
        }
    },
    {
        timestamps: true
    }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
