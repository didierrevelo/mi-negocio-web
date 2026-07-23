# La Cucina - Guía de Producción Cero Costo

## Stack de Producción

| Servicio | Proveedor | Costo |
|----------|-----------|-------|
| **API** | Railway | $0 (crédito $5/mes) |
| **Base de Datos** | MongoDB Atlas | $0 (512MB) |
| **Frontend** | Vercel | $0 |
| **Monitoreo** | UptimeRobot + Sentry | $0 |

---

## 1. Preparar Backend

### Variables de Entorno

```bash
# .env
PORT=3001
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/lacucina
NODE_ENV=production
```

### Instalar Dependencias

```bash
cd backend
npm install
```

### Scripts package.json

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts"
  }
}
```

---

## 2. Desplegar Base de Datos (MongoDB Atlas)

1. Crear cuenta en [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crear cluster gratuito (M0 Sandbox)
3. Crear usuario de base de datos
4. En "Network Access" → Allow Access from Anywhere (0.0.0.0/0)
5. En "Database" → Connect → Drivers → Copiar URI

---

## 3. Desplegar API (Railway)

1. Crear cuenta en [railway.app](https://railway.app)
2. Conectar repositorio de GitHub
3. Seleccionar el backend
4. Agregar variables de entorno:
   - `MONGODB_URI`: URI de MongoDB Atlas
   - `NODE_ENV`: production
5. Railway detecta automáticamente TypeScript
6. Deploy automático

---

## 4. Desplegar Frontend (Vercel)

1. Crear cuenta en [vercel.com](https://vercel.com)
2. Conectar repositorio de GitHub
3. Seleccionar la carpeta frontend
4. Framework: Vanilla JS
5. Deploy automático

---

## 5. Monitoreo

### UptimeRobot (Disponibilidad)
1. Crear cuenta en [uptimerobot.com](https://www.uptimerobot.com)
2. Agregar HTTP Monitor
3. URL: `https://tu-api.railway.app/api/health`
4. Intervalo: 5 minutos

### Sentry (Errores)
1. Crear cuenta en [sentry.io](https://sentry.io)
2. Instalar `@sentry/node`
3. Configurar en server.ts:
```typescript
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "tu-dsn" });
```

---

## 6. Seguridad (Opcional)

```bash
npm install helmet express-rate-limit express-validator
```

```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

---

## Funcionalidades Especiales

### Reservaciones
- Formulario completo en el frontend
- Estados: pending → confirmed | cancelled
- Campos: nombre, email, teléfono, fecha, hora, personas, notas

### Menú
- Categorías: entradas, pasta, pizzas, carnes, postres, bebidas
- Tags: Vegetariano, Popular, Sin Gluten, etc.
- Disponibilidad por plato

---

## Costos Totales

| Servicio | Costo Mensual |
|----------|---------------|
| Railway | $0 |
| MongoDB Atlas | $0 |
| Vercel | $0 |
| UptimeRobot | $0 |
| Sentry | $0 |
| **Total** | **$0/mes** |

---

## URLs de Producción

- **API**: `https://tu-api.railway.app`
- **Frontend**: `https://tu-frontend.vercel.app`
- **Health Check**: `https://tu-api.railway.app/api/health`
