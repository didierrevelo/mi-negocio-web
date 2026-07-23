// ============================================
// RUTAS DE AUTENTICACIÓN
// Módulo: Auth
// Responsabilidad: Login, invitación de usuarios, perfil, cambio de contraseña
// Escalabilidad: Stateless (JWT), cada request es independiente
// ============================================

// Express: Framework web para crear rutas HTTP
// Conecta: Con server.ts que monta esta ruta en /auth
import express from 'express';

// Router: Crea un enrutador para agrupar rutas relacionadas
// Conecta: Con server.ts via app.use('/auth', router)
const router = express.Router();

// bcryptjs: Library para hashear contraseñas (nunca guardar en texto plano)
// Conecta: Con User.password en schema.prisma (almacena hash)
import bcrypt from 'bcryptjs';

// jsonwebtoken: Para crear tokens JWT de autenticación
// Conecta: Con middleware/auth.ts que verifica el token, con .env (JWT_SECRET)
import jwt from 'jsonwebtoken';

// PrismaClient: Cliente ORM para consultas a PostgreSQL
// Conecta: Con schema.prisma (model User, UserMinistryRole)
import { PrismaClient } from '@prisma/client';

// authenticate: Middleware que verifica el token JWT
// Conecta: Con middleware/auth.ts, se usa en /me y /password
// AuthRequest: Interface extendida con userId y user
import { authenticate, AuthRequest } from '../middleware/auth';

// Instancia de Prisma para esta ruta
// Escalabilidad: Se crea una instancia por módulo, Prisma maneja el pool de conexiones
const prisma = new PrismaClient();

// ============================================
// POST /auth/login
// ============================================
// Qué: Autentica un usuario y retorna un token JWT
// Cómo: Valida credenciales → genera token → retorna token + datos usuario
// Conecta: 
//   - Input: { email, password } del body
//   - Output: { token, user } 
//   - Frontend: mobile/src/services/api.ts (authAPI.login)
//   - Security: bcrypt.compare() verifica contraseña hasheada
//   - Escalabilidad: Stateless, el token se verifica sin consultar BD
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    // Extrae email y password del body del request
    // Conecta: Con el frontend que envía { email, password }
    const { email, password } = req.body;

    // Busca el usuario por email en la BD
    // Conecta: Con schema.prisma (model User, campo email con @unique)
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Si no existe el usuario, retorna 401 (Unauthorized)
    // Security: No revelar si el email existe o no (mensaje genérico)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verifica si el usuario está activo
    // Conecta: Con User.isActive en schema.prisma
    // Escalabilidad: Permite desactivar usuarios sin eliminarlos
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account inactive' });
    }

    // Compara la contraseña ingresada con el hash almacenado
    // Conecta: Con bcrypt.hash() en invite() que crea el hash
    // Security: bcrypt.compare() es seguro contra timing attacks
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Genera el token JWT con el userId
    // Conecta: 
      // - JWT_SECRET de .env (clave para firmar)
    //   - JWT_EXPIRES_IN de .env (tiempo de expiración)
    //   - middleware/auth.ts que verifica este token
    // Escalabilidad: Token stateless, no necesita sesión en servidor
    const token = jwt.sign(
      { userId: user.id },  // Payload: datos codificados en el token
      process.env.JWT_SECRET!,  // Clave secreta para firmar
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // Expira en 7 días
    );

    // Retorna el token y datos del usuario (sin password)
    // Conecta: Con frontend que almacena token en AsyncStorage
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
    // Error del servidor (BD caída, etc.)
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// POST /auth/invite
// ============================================
// Qué: Admin invita a un nuevo usuario al sistema
// Cómo: Crea usuario con contraseña temporal → asigna ministerios y roles
// Conecta:
//   - Input: { email, name, phone, ministryIds[], roleIds[] }
//   - Output: { message, user }
//   - Security: Solo admin puede invitar (authenticate + isAdmin check)
//   - Escalabilidad: No registro abierto, control total de acceso
//   - Frontend: mobile/src/screens/ProfileScreen.tsx (opción invitar)
router.post('/invite', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    // Verifica que el usuario sea admin
    // Conecta: Con authenticate() que llena req.user, con User.isAdmin
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin only' });
    }

    // Extrae datos del body
    // Conecta: Con el formulario de invitación del frontend
    const { email, name, phone, ministryIds, roleIds } = req.body;

    // Verifica que el email no esté registrado
    // Conecta: Con User.email (@unique en schema.prisma)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Crea hash de contraseña temporal "temp123"
    // Conecta: Con bcrypt, el usuario deberá cambiar su contraseña
    // Security: 10 rounds de salt (factor de trabajo)
    const tempPassword = await bcrypt.hash('temp123', 10);
    
    // Crea el usuario en la BD
    // Conecta: Con schema.prisma (model User)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: tempPassword,
        isActive: true
      }
    });

    // Asigna ministerios y roles al usuario
    // Conecta: Con schema.prisma (model UserMinistryRole)
    // Escalabilidad: Permite múltiples ministerios por usuario
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

    // Retorna confirmación
    res.status(201).json({
      message: 'Invitation sent',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET /auth/me
// ============================================
// Qué: Retorna los datos del usuario autenticado
// Cómo: Usa el token para identificar al usuario → busca en BD con relaciones
// Conecta:
//   - Input: Token en header Authorization
//   - Output: { id, name, email, phone, isAdmin, ministryRoles[] }
//   - Frontend: mobile/src/screens/ProfileScreen.tsx
//   - Escalabilidad: Cacheable en el frontend ( AsyncStorage)
router.get('/me', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    // Busca el usuario con sus ministerios y roles
    // Conecta: Con UserMinistryRole → Ministry → MinistryRole (relaciones)
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isAdmin: true,
        // Incluye las relaciones de ministerios
        ministryRoles: {
          include: {
            ministry: true,      // Ministerio completo (name, id)
            ministryRole: true   // Rol completo (name, id)
          }
        }
      }
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PUT /auth/password
// ============================================
// Qué: Cambia la contraseña del usuario autenticado
// Cómo: Valida contraseña actual → hashea nueva → actualiza en BD
// Conecta:
//   - Input: { currentPassword, newPassword }
//   - Output: { message }
//   - Security: Requiere contraseña actual para confirmar identidad
//   - Frontend: mobile/src/screens/ProfileScreen.tsx
router.put('/password', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Busca el usuario actual
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verifica que la contraseña actual sea correcta
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password incorrect' });
    }

    // Hashea la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualiza en la BD
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Exporta el router para usar en server.ts
// Conecta: Con server.ts via app.use('/auth', router)
module.exports = router;
