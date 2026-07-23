import express from 'express';
const router = express.Router();
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

// GET /files/:serviceId
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

// POST /files/:serviceId/upload
router.post('/:serviceId/upload', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { filename, filetype, filesize, ministryId } = req.body;

    const key = `services/${req.params.serviceId}/${uuidv4()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: filetype,
      ContentLength: filesize
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // Save file reference in database
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

// DELETE /files/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    await prisma.file.delete({ where: { id: req.params.id } });
    res.json({ message: 'File deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
