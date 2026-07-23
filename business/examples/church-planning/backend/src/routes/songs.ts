// ============================================
// RUTAS DE CANCIONES (SET LIST)
// Módulo: Songs
// Responsabilidad: CRUD de canciones, historial de cambios, notificación de tono
// Escalabilidad: Historial de cambios, notificaciones automáticas
// ============================================

import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// ============================================
// GET /songs/:serviceId
// ============================================
// Qué: Lista el set list de un servicio
// Conecta:
//   - Output: Array de songs ordenados por order
//   - Frontend: mobile/src/screens/SongsScreen.tsx
router.get('/:serviceId', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const songs = await prisma.song.findMany({
      where: { serviceId: req.params.serviceId },
      orderBy: { order: 'asc' },
      include: {
        updatedBy: { select: { id: true, name: true } }
      }
    });
    res.json(songs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /songs/:serviceId
// ============================================
// Qué: Agrega una canción al set list
// Cómo: Auto-incrementa order → crea canción
// Conecta:
//   - Input: { title, key, lyricsUrl, sheetMusicUrl, youtubeLink }
//   - Output: Song creada
router.post('/:serviceId', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, key, lyricsUrl, sheetMusicUrl, youtubeLink } = req.body;

    // Calcula siguiente orden
    const lastSong = await prisma.song.findFirst({
      where: { serviceId: req.params.serviceId },
      orderBy: { order: 'desc' }
    });
    const nextOrder = (lastSong?.order || 0) + 1;

    const song = await prisma.song.create({
      data: {
        serviceId: req.params.serviceId,
        order: nextOrder,
        title,
        key,
        lyricsUrl,
        sheetMusicUrl,
        youtubeLink,
        updatedById: req.userId
      }
    });

    res.status(201).json(song);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// PATCH /songs/:id
// ============================================
// Qué: Actualiza una canción (tono, letra, partitura, link)
// Cómo: Registra cambio en historial → notifica si cambió el tono
// Conecta:
//   - Input: { title, order, key, lyricsUrl, sheetMusicUrl, youtubeLink }
//   - Historial: SongHistory si cambia key
//   - Notificación: A músicos si cambia tono
router.patch('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, order, key, lyricsUrl, sheetMusicUrl, youtubeLink } = req.body;

    // Obtiene canción actual para comparar
    const currentSong = await prisma.song.findUnique({ where: { id: req.params.id } });

    const song = await prisma.song.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(order !== undefined && { order }),
        ...(key && { key }),
        ...(lyricsUrl !== undefined && { lyricsUrl }),
        ...(sheetMusicUrl !== undefined && { sheetMusicUrl }),
        ...(youtubeLink !== undefined && { youtubeLink }),
        updatedById: req.userId
      }
    });

    // Registra cambio de tono en historial
    // Conecta: Con schema.prisma (model SongHistory)
    if (key && currentSong && key !== currentSong.key) {
      await prisma.songHistory.create({
        data: {
          songId: song.id,
          field: 'key',
          oldValue: currentSong.key,
          newValue: key,
          modifiedById: req.userId
        }
      });

      // Notifica a músicos del ministerio de Alabanza
      const service = await prisma.service.findUnique({
        where: { id: song.serviceId },
        include: { team: { include: { user: true } } }
      });

      if (service) {
        const musicians = service.team.filter(t => 
          t.ministry.name === 'Alabanza' || t.ministry.name === 'Worship'
        );
        
        for (const musician of musicians) {
          await prisma.notification.create({
            data: {
              userId: musician.userId,
              type: 'song_key_change',
              message: `El tono de "${song.title}" cambió de ${currentSong.key} a ${key}`,
              referenceId: song.id,
              referenceType: 'song'
            }
          });
        }
      }
    }

    res.json(song);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// GET /songs/:id/history
// ============================================
// Qué: Historial de cambios de una canción
// Conecta: Con SongHistory.modifiedBy → User
router.get('/:id/history', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const history = await prisma.songHistory.findMany({
      where: { songId: req.params.id },
      orderBy: { createdAt: 'desc' },
      include: {
        modifiedBy: { select: { id: true, name: true } }
      }
    });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DELETE /songs/:id
// ============================================
// Qué: Elimina una canción del set list
router.delete('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    await prisma.song.delete({ where: { id: req.params.id } });
    res.json({ message: 'Song deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
