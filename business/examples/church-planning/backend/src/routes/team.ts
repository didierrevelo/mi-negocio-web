import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// GET /team/:serviceId
router.get('/:serviceId', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const team = await prisma.serviceTeam.findMany({
      where: { serviceId: req.params.serviceId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        ministry: true,
        ministryRole: true
      }
    });

    // Group by ministry
    const grouped = team.reduce((acc: any, member) => {
      const ministryName = member.ministry.name;
      if (!acc[ministryName]) {
        acc[ministryName] = { ministry: member.ministry, members: [] };
      }
      acc[ministryName].members.push(member);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /team/:serviceId
router.post('/:serviceId', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { userId, ministryId, ministryRoleId } = req.body;

    const member = await prisma.serviceTeam.create({
      data: {
        serviceId: req.params.serviceId,
        userId,
        ministryId,
        ministryRoleId
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ministry: true,
        ministryRole: true
      }
    });

    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /team/:id/status
router.patch('/:id/status', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { status, note } = req.body;

    const member = await prisma.serviceTeam.update({
      where: { id: req.params.id },
      data: { status, note }
    });

    // Notify admin if status is negative
    if (status === 'cannot_attend' || status === 'schedule_conflict') {
      const service = await prisma.service.findUnique({
        where: { id: member.serviceId },
        include: { creator: true }
      });

      if (service) {
        await prisma.notification.create({
          data: {
            userId: service.createdBy,
            type: 'team_status_change',
            message: `${req.user?.name} ${status === 'cannot_attend' ? 'no puede asistir' : 'tiene conflicto de horario'} al servicio "${service.title}"`,
            referenceId: member.serviceId,
            referenceType: 'service'
          }
        });
      }
    }

    res.json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /team/:id
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    await prisma.serviceTeam.delete({ where: { id: req.params.id } });
    res.json({ message: 'Member removed from team' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /team/positions/:serviceId
router.get('/positions/:serviceId', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const positions = await prisma.positionRequest.findMany({
      where: { serviceId: req.params.serviceId },
      include: {
        ministryRole: { include: { ministry: true } },
        user: { select: { id: true, name: true } }
      }
    });
    res.json(positions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /team/positions/:serviceId
router.post('/positions/:serviceId', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { ministryRoleId, userId } = req.body;

    const position = await prisma.positionRequest.create({
      data: {
        serviceId: req.params.serviceId,
        ministryRoleId,
        userId
      },
      include: {
        ministryRole: { include: { ministry: true } },
        user: { select: { id: true, name: true } }
      }
    });

    // Notify user if assigned
    if (userId) {
      const service = await prisma.service.findUnique({
        where: { id: req.params.serviceId }
      });

      await prisma.notification.create({
        data: {
          userId,
          type: 'position_request',
          message: `Se te ha asignado una posición en el servicio "${service?.title}"`,
          referenceId: position.id,
          referenceType: 'position_request'
        }
      });
    }

    res.status(201).json(position);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /team/positions/:id/respond
router.patch('/positions/:id/respond', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    const position = await prisma.positionRequest.update({
      where: { id: req.params.id },
      data: {
        status,
        respondedAt: new Date()
      }
    });

    // Notify admin
    const service = await prisma.service.findUnique({
      where: { id: position.serviceId }
    });

    if (service) {
      await prisma.notification.create({
        data: {
          userId: service.createdBy,
          type: 'position_response',
          message: `${req.user?.name} ${status === 'accepted' ? 'aceptó' : 'rechazó'} la solicitud para el servicio "${service.title}"`,
          referenceId: position.id,
          referenceType: 'position_request'
        }
      });
    }

    res.json(position);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
