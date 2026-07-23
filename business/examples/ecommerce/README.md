# TechStore - E-Commerce Platform

Una plataforma de comercio electrónico completa para tienda de tecnología, desarrollada con Node.js, Express y MongoDB.

## Características

- **Frontend Moderno**: Interfaz responsive con HTML5, CSS3 y JavaScript vanilla
- **API RESTful**: Backend robusto con Express.js
- **Base de Datos**: MongoDB con Mongoose ODM
- **Carrito de Compras**: Sistema de carrito en tiempo real
- **Filtros y Búsqueda**: Por categoría, precio y texto
- **Diseño Responsive**: Optimizado para móviles y desktop

## Tecnologías

### Frontend
- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- JavaScript ES6+

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Instalación

### Prerrequisitos
- Node.js (v18 o superior)
- MongoDB (local o Atlas)

### Pasos

1. Clonar el repositorio
```bash
git clone https://github.com/didierrevelo/techstore.git
cd techstore
```

2. Instalar dependencias del backend
```bash
cd backend
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar el servidor
```bash
npm run dev
```

5. Abrir el frontend
```
Abre frontend/index.html en tu navegador
```

## API Endpoints

### Products
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto
- `POST /api/products` - Crear un producto
- `PUT /api/products/:id` - Actualizar un producto
- `DELETE /api/products/:id` - Eliminar un producto

### Cart
- `GET /api/cart/:userId` - Obtener carrito
- `POST /api/cart/:userId/items` - Agregar item
- `PUT /api/cart/:userId/items/:productId` - Actualizar cantidad
- `DELETE /api/cart/:userId/items/:productId` - Eliminar item

### Orders
- `GET /api/orders` - Obtener órdenes
- `POST /api/orders` - Crear orden
- `PUT /api/orders/:id/status` - Actualizar estado

## Estructura

```
techstore/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── models/
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── server.js
│   └── package.json
└── README.md
```

## Autor

**Didier Revelo**
- GitHub: [@didierrevelo](https://github.com/didierrevelo)
- Email: didier@example.com

## Licencia

MIT
