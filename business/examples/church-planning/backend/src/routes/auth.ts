import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// POST /auth/login
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account inactive' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /auth/invite
router.post('/invite', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { email, name, phone, ministryIds, roleIds } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user with temporary password
    const tempPassword = await bcrypt.hash('temp123', 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: tempPassword,
        isActive: true
      }
    });

    // Assign ministry roles
    if (ministryIds && roleIds && ministryIds.length === roleIds.length) {
      for (let i = 0; i < ministryIds.length; i++) {
        await prisma.userMinistryRole.create({
          data: {
            userId: user.id,
            ministryId: ministryIds[i],
            ministryRoleId: roleIds[i]
          }
        });
      }
    }

    res.status(201).json({
      message: 'Invitation sent',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isAdmin: true,
        ministryRoles: {
          include: {
            ministry: true,
            ministryRole: true
          }
        }
      }
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /auth/password
router.put('/password', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
