// ============================================
// MODELO: PRODUCTO (TECHSTORE)
// ============================================
// Qué: Define la estructura de un producto en la tienda
// Campos: nombre, descripción, precio, categoría, imagen, stock, destacado, ratings
// Conecta: Con routes/products.ts (CRUD), con frontend/app.js (renderizado)
// Categorías: laptops, phones, audio, gaming, accessories

import mongoose, { Document, Schema } from 'mongoose';

// ============================================
// INTERFAZ: IProduct
// ============================================
// Qué: Define los campos del producto con tipos TypeScript
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

// ============================================
// SCHEMA: productSchema
// ============================================
// Qué: Define la estructura MongoDB del producto
// Valida: Tipos, requeridos, valores mínimos
const productSchema = new Schema<IProduct>(
    {
        // Nombre del producto
        name: {
            type: String,
            required: true,
            trim: true
        },
        // Descripción detallada
        description: {
            type: String,
            required: true
        },
        // Precio actual (en dólares)
        price: {
            type: Number,
            required: true,
            min: 0
        },
        // Precio anterior (opcional, para mostrar descuento)
        oldPrice: {
            type: Number,
            min: 0
        },
        // Categoría del producto
        category: {
            type: String,
            required: true,
            enum: ['laptops', 'phones', 'audio', 'gaming', 'accessories']
        },
        // Emoji representativo del producto
        image: {
            type: String,
            default: '📦'
        },
        // Cantidad disponible en inventario
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        // Si aparece en destacados
        featured: {
            type: Boolean,
            default: false
        },
        // Calificaciones promedio
        ratings: {
            average: { type: Number, default: 0 },
            count: { type: Number, default: 0 }
        }
    },
    {
        // Agrega createdAt y updatedAt automáticamente
        timestamps: true
    }
);

// ============================================
// ÍNDICES
// ============================================
// Texto: Búsqueda por nombre y descripción
productSchema.index({ name: 'text', description: 'text' });
// Compuesto: Filtro por categoría y precio
productSchema.index({ category: 1, price: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
