// ============================================
// RUTAS DE SERVICIOS (CULTOS)
// Módulo: Services
// Responsabilidad: CRUD de servicios, segmentos del orden del culto
// Escalabilidad: Paginación, filtros por fecha/estado, índices en BD
// ============================================

import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// ============================================
// GET /services
// ============================================
// Qué: Lista todos los servicios próximos
// Cómo: Consulta BD ordenados por fecha ascendente
// Conecta:
//   - Output: Array de services con conteo de team, songs, files
//   - Frontend: mobile/src/screens/HomeScreen.tsx (servicesAPI.getAll)
//   - Escalabilidad: Agregar paginación con skip/take para muchos registros
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    // Busca todos los servicios ordenados por fecha (más próximo primero)
    // Conecta: Con schema.prisma (model Service)
    const services = await prisma.service.findMany({
      orderBy: { date: 'asc' },
      include: {
        // Cuenta cuántos miembros, canciones y archivos tiene cada servicio
        // Escalabilidad: Conteo eficiente sin cargar datos completos
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

// ============================================
// GET /services/:id
// ============================================
// Qué: Detalle completo de un servicio
// Cómo: Carga servicio con todos los datos relacionados y agrupa equipo por ministerio
// Conecta:
//   - Input: id (parámetro de URL)
//   - Output: Service con segments, team, songs, files, teamByMinistry
//   - Frontend: mobile/src/screens/ServiceDetailScreen.tsx
//   - Escalabilidad:select solo los campos necesarios
router.get('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    // Busca el servicio con todas sus relaciones
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        // Segmentos ordenados por posición
        segments: {
          orderBy: { order: 'asc' },
          include: { ministry: true, responsible: true }
        },
        // Equipo del servicio con datos de usuario, ministerio y rol
        team: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            ministry: true,
            ministryRole: true
          }
        },
        // Set list musical ordenado
        songs: { orderBy: { order: 'asc' } },
        // Archivos subidos
        files: {
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: { select: { id: true, name: true } } }
        },
        // Solicitudes de posiciones
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

    // Agrupa el equipo por ministerio para la vista
    // Qué: Transforma array plano en objeto { "Alabanza": [...], "Producción": [...] }
    // Conecta: Con mobile/src/screens/ServiceDetailScreen.tsx que renderiza por ministerio
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

// ============================================
// POST /services
// ============================================
// Qué: Crea un nuevo servicio/culto
// Cómo: Valida datos → crea en BD → retorna servicio creado
// Conecta:
//   - Input: { title, date, time, type, notes }
//   - Output: Service creado
//   - Security: Solo admin (requireAdmin)
//   - Frontend: Formulario de creación de servicio
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, date, time, type, notes } = req.body;

    // Crea el servicio con el ID del creador
    // Conecta: Con Service.createdBy → User.id
    const service = await prisma.service.create({
      data: {
        title,
        date: new Date(date),  // Convierte string a Date
        time,
        type,
        notes,
        createdBy: req.userId!  // Admin que creó el servicio
      }
    });

    res.status(201).json(service);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// PATCH /services/:id
// ============================================
// Qué: Actualiza un servicio existente
// Cómo: Actualiza solo los campos enviados (merge parcial)
// Conecta:
//   - Input: Campos opcionales { title, date, time, type, status, notes }
//   - Output: Service actualizado
//   - Security: Solo admin
router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, date, time, type, status, notes } = req.body;

    // Actualiza solo los campos enviados (spread condicional)
    // Escalabilidad: No sobrescribe campos no enviados
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

// ============================================
// DELETE /services/:id
// ============================================
// Qué: Elimina un servicio
// Cómo: Elimina en cascada todos los datos relacionados
// Conecta:
//   - Input: id del servicio
//   - Output: { message }
//   - Security: Solo admin
//   - Conexión en cascada: ServiceSegment, ServiceTeam, Song, File se eliminan
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ message: 'Service deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// GET /services/:id/segments
// ============================================
// Qué: Lista los segmentos del orden del culto
// Cómo: Consulta ServiceSegment ordenados por posición
// Conecta:
//   - Output: Array de segments con ministry y responsible
//   - Frontend: ServiceDetailScreen (sección "Orden del Culto")
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

// ============================================
// POST /services/:id/segments
// ============================================
// Qué: Agrega un segmento al orden del culto
// Cómo: Calcula siguiente orden → crea segmento
// Conecta:
//   - Input: { title, durationMin, notes, ministryId, responsibleId }
//   - Output: Segment creado
//   - Auto-incremento: order = último + 1
router.post('/:id/segments', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, durationMin, notes, ministryId, responsibleId } = req.body;
    
    // Obtiene el último número de orden
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

// ============================================
// PATCH /services/segments/:id
// ============================================
// Qué: Actualiza un segmento (reordenar, editar título, etc.)
// Cómo: Actualiza campos enviados
// Conecta:
//   - Input: { order, title, durationMin, notes, ministryId, responsibleId }
//   - Output: Segment actualizado
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

// ============================================
// DELETE /services/segments/:id
// ============================================
// Qué: Elimina un segmento del orden del culto
// Conecta: Con ServiceSegment.onDelete: Cascade en schema.prisma
router.delete('/segments/:id', authenticate, requireAdmin, async (req: AuthRequest, res: express.Response) => {
  try {
    await prisma.serviceSegment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Segment deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
