import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// GET /services
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { date: 'asc' },
      include: {
        _count: {
          select: { team: true, songs: true, files: true }
        }
      }
    });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /services/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        segments: {
          orderBy: { order: 'asc' },
          include: { ministry: true, responsible: true }
        },
        team: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            ministry: true,
            ministryRole: true
          }
        },
        songs: {
          orderBy: { order: 'asc' }
        },
        files: {
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: { select: { id: true, name: true } } }
        },
        positionRequests: {
          include: {
            ministryRole: true,
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Group team by ministry
    const teamByMinistry = service.team.reduce((acc: any, member) => {
      const ministryName = member.ministry.name;
      if (!acc[ministryName]) {
        acc[ministryName] = [];
      }
      acc[ministryName].push(member);
      return acc;
    }, {});

    res.json({ ...service, teamByMinistry });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /services
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, date, time, type, notes } = req.body;

    const service = await prisma.service.create({
      data: {
        title,
        date: new Date(date),
        time,
        type,
        notes,
        createdBy: req.userId!
      }
    });

    res.status(201).json(service);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /services/:id
router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, date, time, type, status, notes } = req.body;

    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(type && { type }),
        ...(status && { status }),
        ...(notes !== undefined && { notes })
      }
    });

    res.json(service);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /services/:id
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ message: 'Service deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /services/:id/segments
router.get('/:id/segments', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const segments = await prisma.serviceSegment.findMany({
      where: { serviceId: req.params.id },
      orderBy: { order: 'asc' },
      include: { ministry: true, responsible: true }
    });
    res.json(segments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /services/:id/segments
router.post('/:id/segments', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, durationMin, notes, ministryId, responsibleId } = req.body;
    
    // Get next order number
    const lastSegment = await prisma.serviceSegment.findFirst({
      where: { serviceId: req.params.id },
      orderBy: { order: 'desc' }
    });
    const nextOrder = (lastSegment?.order || 0) + 1;

    const segment = await prisma.serviceSegment.create({
      data: {
        serviceId: req.params.id,
        order: nextOrder,
        title,
        durationMin,
        notes,
        ministryId,
        responsibleId
      }
    });

    res.status(201).json(segment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /segments/:id
router.patch('/segments/:id', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { order, title, durationMin, notes, ministryId, responsibleId } = req.body;

    const segment = await prisma.serviceSegment.update({
      where: { id: req.params.id },
      data: {
        ...(order !== undefined && { order }),
        ...(title && { title }),
        ...(durationMin !== undefined && { durationMin }),
        ...(notes !== undefined && { notes }),
        ...(ministryId !== undefined && { ministryId }),
        ...(responsibleId !== undefined && { responsibleId })
      }
    });

    res.json(segment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /segments/:id
router.delete('/segments/:id', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    await prisma.serviceSegment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Segment deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
