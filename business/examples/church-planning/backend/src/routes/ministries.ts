import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// GET /ministries
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const ministries = await prisma.ministry.findMany({
      where: { isActive: true },
      include: {
        roles: { where: { isActive: true } },
        _count: { select: { userMinistryRoles: true } }
      }
    });
    res.json(ministries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /ministries
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { name } = req.body;
    const ministry = await prisma.ministry.create({ data: { name } });
    res.status(201).json(ministry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /ministries/:id
router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { name, isActive } = req.body;
    const ministry = await prisma.ministry.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(isActive !== undefined && { isActive }) }
    });
    res.json(ministry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /ministries/:id/roles
router.get('/:id/roles', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const roles = await prisma.ministryRole.findMany({
      where: { ministryId: req.params.id, isActive: true }
    });
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /ministries/:id/roles
router.post('/:id/roles', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { name } = req.body;
    const role = await prisma.ministryRole.create({
      data: { name, ministryId: req.params.id }
    });
    res.status(201).json(role);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /ministry-roles/:id
router.patch('/roles/:id', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { name, isActive } = req.body;
    const role = await prisma.ministryRole.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(isActive !== undefined && { isActive }) }
    });
    res.json(role);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
