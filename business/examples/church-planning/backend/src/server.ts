// ============================================
// SERVIDOR PRINCIPAL - CHURCH PLANNING API
// Versión: Producción (Costo Cero)
// Seguridad: Helmet, Rate Limiting, CORS, Input Validation
// Monitoreo: Sentry, Morgan, Health Check
// ============================================

// Express: Framework web para Node.js
import express from 'express';

// CORS: Middleware para requests desde el móvil
import cors from 'cors';

// dotenv: Carga variables de entorno desde .env
import dotenv from 'dotenv';

// PrismaClient: Cliente ORM para PostgreSQL
import { PrismaClient } from '@prisma/client';

// Helmet: Headers de seguridad HTTP
// Qué: Agrega headers como X-Frame-Options, CSP, HSTS
// Seguridad: Previene ataques XSS, clickjacking, sniffing
import helmet from 'helmet';

// Rate Limiting: Limita requests por IP
// Qué: Máximo 100 requests por 15 minutos por IP
// Seguridad: Previene ataques DDoS y brute force
import rateLimit from 'express-rate-limit';

// Morgan: Logger HTTP para requests
// Qué: Registra cada request con method, url, status, tiempo
// Monitoreo: Ayuda a debugging y auditoría
import morgan from 'morgan';

// Sentry: Error tracking y monitoring
// Qué: Captura errores no manejados y los reporta
// Monitoreo: Dashboard con alertas y métricas
import * as Sentry from '@sentry/node';

// ============================================
// INICIALIZACIÓN
// ============================================

// Carga variables de entorno
dotenv.config();

// Inicializa Sentry (DEBE ser antes de cualquier otro middleware)
// Conecta: Con SENTRY_DSN en .env
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,  // 100% de traces para debugging
});

// Crea la instancia de Express
const app = express();

// Crea el cliente de Prisma
// Escalabilidad: Prisma maneja pool de conexiones automáticamente
const prisma = new PrismaClient();

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES DE SEGURIDAD
// ============================================

// Helmet: Headers de seguridad HTTP
// Qué: Agrega múltiples headers de seguridad
// Seguridad:
//   - X-Frame-Options: PREVENIR clickjacking
//   - X-Content-Type-Options: PREVENIR MIME sniffing
//   - HSTS: FORZAR HTTPS
//   - CSP: PREVENIR XSS
//   - X-XSS-Protection: Filtrar scripts maliciosos
app.use(helmet());

// Rate Limiting: Limita requests por IP
// Qué: Máximo 100 requests por ventana de 15 minutos
// Seguridad:
//   - Previene DDoS
//   - Previene brute force
//   - Previene scraping
// Escalabilidad: Para producción, considerar Redis store
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,                    // 100 requests por ventana
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,       // Retorna info en headers
  legacyHeaders: false,        // No usar headers antiguos
});
app.use(limiter);

// Rate limiting más estricto para auth (prevenir brute force)
// Qué: Máximo 5 requests por 15 minutos para login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // Solo 5 intentos de login
  message: { error: 'Too many login attempts, please try again later' },
});

// CORS: Configuración segura
// Qué: Permite solo origen específico (app móvil)
// Seguridad: No usar * en producción
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',  // En producción, especificar dominio
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body Parser: Convierte JSON a objetos
app.use(express.json({ limit: '10mb' }));  // Limita tamaño de body

// Morgan: Logger HTTP
// Qué: Registra cada request en consola
// Monitoreo: Formato "combined" incluye IP, user-agent, tiempo
app.use(morgan('combined'));

// ============================================
// RUTAS DE LA API
// ============================================

// Auth: Login, invitación, perfil (con rate limiting estricto)
app.use('/auth', authLimiter, require('./routes/auth'));

// Services: CRUD de servicios y segmentos
app.use('/services', require('./routes/services'));

// Ministries: CRUD de ministerios y roles
app.use('/ministries', require('./routes/ministries'));

// Team: Asignación de equipo y solicitudes
app.use('/team', require('./routes/team'));

// Songs: Set list musical
app.use('/songs', require('./routes/songs'));

// Files: Subida de archivos a S3
app.use('/files', require('./routes/files'));

// Notifications: Notificaciones del usuario
app.use('/notifications', require('./routes/notifications'));

// ============================================
// HEALTH CHECK Y MONITOREO
// ============================================

// Health Check: Verifica que el servidor funciona
// Monitoreo: UptimeRobot llama a este endpoint cada 5 minutos
// Conecta: Con UptimeRobot (configurado en PRODUCTION.md)
app.get('/health', async (req, res) => {
  try {
    // Verifica conexión a BD
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// Metrics: Métricas básicas del servidor
// Monitoreo: Dashboard personalizado
app.get('/metrics', async (req, res) => {
  try {
    const [userCount, serviceCount, notificationCount] = await Promise.all([
      prisma.user.count(),
      prisma.service.count(),
      prisma.notification.count({ where: { read: false } })
    ]);

    res.json({
      users: userCount,
      services: serviceCount,
      unreadNotifications: notificationCount,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// Sentry error handler (DEBE ir antes de otros error handlers)
app.use(Sentry.Handlers.errorHandler());

// Error handler global
// Qué: Captura errores no manejados y retorna 500
// Monitoreo: Sentry reporta el error automáticamente
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  // En desarrollo, retorna el error completo
  // En producción, retorna mensaje genérico (no exponer detalles)
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(500).json({ error: errorMessage });
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
