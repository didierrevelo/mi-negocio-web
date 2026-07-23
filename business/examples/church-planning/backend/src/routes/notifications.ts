import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// GET /notifications
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /notifications/unread-count
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

// PATCH /notifications/:id/read
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

// PATCH /notifications/read-all
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
