// ============================================
// RUTAS DE MINISTERIOS Y ROLES
// Módulo: Ministries
// Responsabilidad: CRUD de ministerios y roles configurables
// Escalabilidad: Roles dinámicos (no hardcodeados), activar/desactivar sin eliminar
// ============================================

import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// ============================================
// GET /ministries
// ============================================
// Qué: Lista todos los ministerios activos con sus roles
// Cómo: Filtra por isActive=true, incluye roles y conteo de personas
// Conecta:
//   - Output: Array de ministry con roles y _count
//   - Frontend: mobile/src/screens/TeamScreen.tsx, ServiceDetailScreen.tsx
//   - Escalabilidad: Ministerios editables sin tocar código
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const ministries = await prisma.ministry.findMany({
      where: { isActive: true },  // Solo ministerios activos
      include: {
        roles: { where: { isActive: true } },  // Roles activos de cada ministerio
        _count: { select: { userMinistryRoles: true } }  // Cuántas personas tiene
      }
    });
    res.json(ministries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /ministries
// ============================================
// Qué: Crea un nuevo ministerio
// Conecta: Security: Solo admin
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { name } = req.body;
    const ministry = await prisma.ministry.create({ data: { name } });
    res.status(201).json(ministry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// PATCH /ministries/:id
// ============================================
// Qué: Actualiza nombre o estado de un ministerio
// Escalabilidad: Puede desactivar sin eliminar (mantiene historial)
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

// ============================================
// GET /ministries/:id/roles
// ============================================
// Qué: Lista los roles de un ministerio específico
// Conecta:
//   - Input: ministryId (parámetro URL)
//   - Output: Array de MinistryRole
//   - Frontend: Formulario de asignación de equipo
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

// ============================================
// POST /ministries/:id/roles
// ============================================
// Qué: Crea un rol dentro de un ministerio
// Ejemplo: En "Alabanza" crear rol "Batería"
// Conecta: Con MinistryRole.ministryId → Ministry.id
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

// ============================================
// PATCH /ministries/roles/:id
// ============================================
// Qué: Actualiza o desactiva un rol
// Escalabilidad: Desactivar rol no elimina asignaciones existentes
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
