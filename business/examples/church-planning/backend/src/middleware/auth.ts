// ============================================
// MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
// ============================================

// Express types: Tipos para los parámetros del middleware
// Conecta: Con Express (req, res, next)
import { Request, Response, NextFunction } from 'express';

// jsonwebtoken: Library para crear y verificar JWT tokens
// Conecta: Con .env (JWT_SECRET), routes/auth.ts (login genera token)
import jwt from 'jsonwebtoken';

// PrismaClient: Para buscar usuarios en la BD
// Conecta: Con schema.prisma (model User)
import { PrismaClient } from '@prisma/client';

// Instancia de Prisma para consultas de usuario
// Conecta: Con User.findUnique() en authenticate()
const prisma = new PrismaClient();

// ============================================
// INTERFACZ AUTH REQUEST
// ============================================

// Extiende Request de Express con campos de usuario
// Qué: Agrega userId y user al objeto request
// Cómo: TypeScript interface hereda de Request
// Conecta: Con authenticate() que llena estos campos,
//          con routes/ que usan req.userId y req.user
export interface AuthRequest extends Request {
  userId?: string;  // ID del usuario autenticado
  user?: any;       // Objeto completo del usuario (name, email, isAdmin)
}

// ============================================
// MIDDLEWARE: AUTHENTICATE
// ============================================

// Verifica que el usuario tenga un token JWT válido
// Qué: Extrae el token del header, lo verifica, busca el usuario
// Cómo: 
//   1. Lee Authorization: "Bearer <token>" del header
//   2. jwt.verify() decodifica el token con JWT_SECRET
//   3. Busca el usuario en la BD por decoded.userId
//   4. Si existe y está activo, llena req.userId y req.user
// Conecta: 
//   - Input: Header "Authorization" del request
//   - Output: req.userId, req.user (para usar en routes/)
//   - .env: JWT_SECRET
//   - schema.prisma: User.findUnique()
//   - routes/auth.ts: Genera el token en login
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extrae el token del header Authorization
    // Formato esperado: "Bearer eyJhbGciOiJIUzI1NiIs..."
    const token = req.headers.authorization?.replace('Bearer ', '');

    // Si no hay token, retorna 401 (Unauthorized)
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verifica y decodifica el token
    // Qué: jwt.verify() valida la firma con JWT_SECRET
    // Cómo: Retorna { userId: "..." } o lanza error si es inválido
    // Conecta: Con JWT_SECRET en .env, con login() en auth.ts que genera el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Busca el usuario completo en la BD
    // Qué: Obtiene id, name, email, isAdmin, isActive
    // Cómo: Prisma findUnique() busca por id
    // Conecta: Con schema.prisma (model User), con authenticate() que necesita isAdmin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isActive: true
      }
    });

    // Si el usuario no existe o está desactivado, retorna 401
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    // Llena los campos de usuario en el request
    // Qué: Permite que routes/ usen req.userId y req.user
    // Cómo: Asigna valores al request
    // Conecta: Con AuthRequest interface, con routes/ que usan req.userId
    req.userId = user.id;
    req.user = user;
    
    // Continúa al siguiente middleware o ruta
    next();
  } catch (error) {
    // Si jwt.verify() falla (token inválido/expirado), retorna 401
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================
// MIDDLEWARE: REQUIRE ADMIN
// ============================================

// Verifica que el usuario sea administrador
// Qué: Solo permite admins acceder a la ruta
// Cómo: Revisa req.user.isAdmin (ya llenado por authenticate())
// Conecta: 
//   - Input: req.user (de authenticate())
//   - Output: 403 si no es admin, next() si es admin
//   - Se usa en: services.ts (crear servicio), ministries.ts (CRUD)
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Si el usuario no es admin, retorna 403 (Forbidden)
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  // Si es admin, continúa
  next();
};

// ============================================
// MIDDLEWARE: REQUIRE MINISTRY LEADER
// ============================================

// Verifica que el usuario sea líder del ministerio especificado
// Qué: Permite a líderes de ministerio gestionar su equipo
// Cómo: 
//   1. Lee ministryId de los parámetros de la URL
//   2. Busca en UserMinistryRole si el usuario es líder de ese ministerio
//   3. Si no es líder y no es admin, retorna 403
// Conecta:
//   - Input: req.userId (de authenticate()), req.params.ministryId (de la URL)
//   - Output: 403 si no tiene permisos, next() si es líder o admin
//   - schema.prisma: UserMinistryRole.findFirst()
//   - Se usa en: team.ts para asignar miembros del ministerio
export const requireMinistryLeader = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtiene el ID del ministerio de los parámetros de la URL
    // Ejemplo: /team/ministries/:ministryId → req.params.ministryId = "alabanza"
    const { ministryId } = req.params;
    
    // Busca si el usuario es líder de este ministerio
    // Qué: Revisa la tabla UserMinistryRole con isLeader: true
    // Cómo: findFirst() retorna el primer registro o null
    // Conecta: Con schema.prisma (model UserMinistryRole)
    const userMinistryRole = await prisma.userMinistryRole.findFirst({
      where: {
        userId: req.userId,      // Usuario autenticado
        ministryId,              // Ministerio de la URL
        isLeader: true           // Debe ser líder
      }
    });

    // Si no es líder Y no es admin, retorna 403
    if (!userMinistryRole && !req.user?.isAdmin) {
      res.status(403).json({ error: 'Ministry leader access required' });
      return;
    }

    // Si es líder o admin, continúa
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
