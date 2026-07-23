// ============================================
// RUTAS DE NOTIFICACIONES
// Módulo: Notifications
// Responsabilidad: Listar notificaciones, marcar como leídas
// Escalabilidad: Conteo de no leídas para badge, marcar todas como leídas
// ============================================

import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// ============================================
// GET /notifications
// ============================================
// Qué: Lista las notificaciones del usuario (últimas 50)
// Conecta:
//   - Output: Array de notifications ordenadas por fecha
//   - Frontend: mobile/src/screens/ProfileScreen.tsx
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50  // Limita a 50 para performance
    });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /notifications/unread-count
// ============================================
// Qué: Cuenta notificaciones no leídas (para badge)
// Conecta:
//   - Output: { count: number }
//   - Frontend: Badge en navegación
router.get('/unread-count', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.userId, read: false }
    });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PATCH /notifications/:id/read
// ============================================
// Qué: Marca una notificación como leída
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json(notification);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// PATCH /notifications/read-all
// ============================================
// Qué: Marca todas las notificaciones como leídas
router.patch('/read-all', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
