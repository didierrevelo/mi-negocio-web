# Church Planning App

Aplicación móvil para planeación de cultos inspirada en Planning Center Services.

## Tech Stack

- **Mobile:** React Native + Expo
- **Backend:** Node.js + Express + TypeScript
- **Base de Datos:** PostgreSQL + Prisma ORM
- **Storage:** AWS S3 (URLs prefirmadas)
- **Notificaciones:** Firebase Cloud Messaging

## Características

### Fase 1 (MVP)
- ✅ Login por invitación
- ✅ Gestión de ministerios y roles configurables
- ✅ Crear servicio + orden del culto
- ✅ Asignar equipo por ministerio y rol
- ✅ Estado: confirmado / no puede asistir / inconveniente de horario
- ✅ Subir/descargar archivos

### Fase 2
- 🎵 Set list musical (letras, partituras, tono, YouTube)
- 🎸 Solicitudes de instrumento con aceptar/rechazar
- 🔔 Notificaciones push accionables

### Fase 3
- 📊 Historial de servicios pasados
- 📈 Reportes de participación
- 📅 Integración con Google Calendar

## Instalación

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npx prisma migrate dev
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

## Estructura

```
church-planning/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── types/
│   └── App.tsx
└── README.md
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/login | Login |
| POST | /auth/invite | Invitar usuario |
| GET | /services | Listar servicios |
| POST | /services | Crear servicio |
| GET | /services/:id | Detalle del servicio |
| POST | /services/:id/segments | Agregar segmento |
| GET | /team/:serviceId | Equipo por ministerio |
| POST | /team/:serviceId | Asignar miembro |
| PATCH | /team/:id/status | Actualizar estado |
| GET | /songs/:serviceId | Set list |
| POST | /songs/:serviceId | Agregar canción |
| GET | /files/:serviceId | Archivos del servicio |

## Autor

**Didier Revelo** - [@didierrevelo](https://github.com/didierrevelo)
