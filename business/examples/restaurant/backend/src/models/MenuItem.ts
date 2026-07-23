// ============================================
// MODELO: ITEM DEL MENÚ (LA CUCINA)
// ============================================
// Qué: Define la estructura de un plato del restaurante
// Campos: nombre, descripción, precio, categoría, imagen, tags, disponible
// Categorías: entradas, pasta, pizzas, carnes, postres, bebidas
// Conecta: Con routes/menu.ts (CRUD), con frontend/app.js

import mongoose, { Document, Schema } from 'mongoose';

// ============================================
// INTERFAZ: IMenuItem
// ============================================
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

// ============================================
// SCHEMA: menuItemSchema
// ============================================
const menuItemSchema = new Schema<IMenuItem>(
    {
        // Nombre del plato
        name: {
            type: String,
            required: true,
            trim: true
        },
        // Descripción del plato
        description: {
            type: String,
            required: true
        },
        // Precio en dólares
        price: {
            type: Number,
            required: true,
            min: 0
        },
        // Categoría del plato
        category: {
            type: String,
            required: true,
            enum: ['entradas', 'pasta', 'pizzas', 'carnes', 'postres', 'bebidas']
        },
        // Emoji representativo
        image: {
            type: String,
            default: '🍽️'
        },
        // Tags: Vegetariano, Popular, Sin Gluten, etc.
        tags: [{
            type: String
        }],
        // Si está disponible para pedir
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
