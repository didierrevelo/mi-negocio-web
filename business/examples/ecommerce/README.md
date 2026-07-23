# TechStore - E-Commerce Platform

Plataforma de comercio electrónico completa con **Node.js**, **TypeScript** y **MongoDB**.

## Tech Stack

- **Backend:** Node.js + Express + TypeScript
- **Base de Datos:** MongoDB + Mongoose
- **Frontend:** HTML5 + CSS3 + JavaScript

## Instalación

```bash
cd backend
npm install
npm run dev
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/products | Listar productos |
| POST | /api/products | Crear producto |
| PUT | /api/products/:id | Actualizar producto |
| DELETE | /api/products/:id | Eliminar producto |
| GET | /api/cart/:userId | Obtener carrito |
| POST | /api/cart/:userId/items | Agregar al carrito |
| POST | /api/orders | Crear orden |

## Autor

**Didier Revelo** - [@didierrevelo](https://github.com/didierrevelo)
