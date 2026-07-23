// ============================================
// RUTAS DE ARCHIVOS
// Módulo: Files
// Responsabilidad: Subida de archivos a S3, listado, eliminación
// Escalabilidad: Presigned URLs (subida directa a S3 sin saturar el servidor)
// ============================================

import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';

// AWS S3: Para subir archivos a la nube
// Conecta: Con .env (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// getSignedUrl: Genera URL temporal para subir directamente a S3
// Escalabilidad: El servidor no maneja archivos binarios, solo metadata
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// uuid: Genera IDs únicos para los archivos
import { v4 as uuidv4 } from 'uuid';

import { authenticate, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Configuración de S3
// Conecta: Con AWS credentials en .env
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

// ============================================
// GET /files/:serviceId
// ============================================
// Qué: Lista los archivos de un servicio
// Conecta:
//   - Output: Array de files con uploadedBy y ministry
//   - Frontend: ServiceDetailScreen (sección "Archivos")
router.get('/:serviceId', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const files = await prisma.file.findMany({
      where: { serviceId: req.params.serviceId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: { select: { id: true, name: true } },
        ministry: true
      }
    });
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /files/:serviceId/upload
// ============================================
// Qué: Genera URL prefirmada para subir archivo directamente a S3
// Cómo: 
//   1. Crea clave única para S3
//   2. Genera presigned URL (válida 5 minutos)
//   3. Guarda metadata en BD
//   4. Retorna presigned URL + metadata
// Escalabilidad: 
//   - El servidor no recibe archivos binarios
//   - El cliente sube directamente a S3
//   - Reduce carga del servidor y ancho de banda
// Conecta:
//   - Input: { filename, filetype, filesize, ministryId }
//   - Output: { presignedUrl, file }
//   - Frontend: Usa presignedUrl para PUT directo a S3
router.post('/:serviceId/upload', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { filename, filetype, filesize, ministryId } = req.body;

    // Genera clave única para S3
    // Formato: services/{serviceId}/{uuid}-{filename}
    const key = `services/${req.params.serviceId}/${uuidv4()}-${filename}`;

    // Comando para subir archivo a S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: filetype,
      ContentLength: filesize
    });

    // Genera URL prefirmada (válida 5 minutos)
    // Escalabilidad: El cliente sube directo a S3, no pasa por el servidor
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // Guarda metadata del archivo en la BD
    const file = await prisma.file.create({
      data: {
        serviceId: req.params.serviceId,
        uploadedById: req.userId!,
        name: filename,
        type: filetype.split('/').pop() || 'unknown',
        url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        size: filesize,
        ministryId
      }
    });

    res.json({ presignedUrl, file });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DELETE /files/:id
// ============================================
// Qué: Elimina la referencia del archivo de la BD
// Nota: Para eliminar el archivo real de S3, se necesita un Lambda o job separado
router.delete('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    await prisma.file.delete({ where: { id: req.params.id } });
    res.json({ message: 'File deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
