import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// GET /songs/:serviceId
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

// POST /songs/:serviceId
router.post('/:serviceId', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, key, lyricsUrl, sheetMusicUrl, youtubeLink } = req.body;

    // Get next order number
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

// PATCH /songs/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, order, key, lyricsUrl, sheetMusicUrl, youtubeLink } = req.body;

    // Get current song for history
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

    // Record history for key changes
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

      // Notify musicians
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

// GET /songs/:id/history
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

// DELETE /songs/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    await prisma.song.delete({ where: { id: req.params.id } });
    res.json({ message: 'Song deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
