// ============================================
// TYPESCRIPT TYPES - CHURCH PLANNING APP
// ============================================
// Qué: Define interfaces para tipado estático
// Cómo: Cada interfaz representa un modelo de la BD
// Conecta: Con api.ts (respuestas), con screens/ (renderizado)
// Escalabilidad: Type safety previene errores en runtime

// ============================================
// INTERFAZ: User
// ============================================
// Qué: Representa un usuario del sistema
// Conecta: Con schema.prisma (model User), con auth API
export interface User {
  id: string;           // UUID único del usuario
  name: string;         // Nombre completo
  email: string;        // Email (usado para login)
  phone?: string;       // Teléfono (opcional)
  isAdmin: boolean;     // Si true, tiene permisos de admin
}

// ============================================
// INTERFAZ: Ministry
// ============================================
// Qué: Representa un ministerio (Alabanza, Danzas, etc.)
// Conecta: Con schema.prisma (model Ministry)
export interface Ministry {
  id: string;           // ID del ministerio
  name: string;         // Nombre: "Alabanza"
  isActive: boolean;    // Si false, está desactivado
  roles?: MinistryRole[];  // Roles dentro del ministerio
  _count?: { userMinistryRoles: number };  // Cuántas personas tiene
}

// ============================================
// INTERFAZ: MinistryRole
// ============================================
// Qué: Representa un rol dentro de un ministerio
// Ejemplo: "Vocalista" en ministerio "Alabanza"
// Conecta: Con schema.prisma (model MinistryRole)
export interface MinistryRole {
  id: string;           // ID del rol
  name: string;         // Nombre: "Vocalista", "Batería"
  ministryId: string;   // FK: ministerio al que pertenece
  isActive: boolean;    // Si false, rol desactivado
}

// ============================================
// INTERFAZ: Service
// ============================================
// Qué: Representa un servicio/culto
// Conecta: Con schema.prisma (model Service), con HomeScreen, ServiceDetailScreen
export interface Service {
  id: string;           // UUID del servicio
  title: string;        // Título: "Culto Dominical"
  date: string;         // Fecha ISO (YYYY-MM-DD)
  time: string;         // Hora: "10:00 AM"
  type: string;         // Tipo: "worship", "youth"
  status: 'planned' | 'confirmed' | 'finished';  // Estado
  notes?: string;       // Notas generales
  createdBy: string;    // FK: admin que creó
  segments?: ServiceSegment[];  // Orden del culto
  team?: ServiceTeamMember[];   // Equipo asignado
  songs?: Song[];                // Set list
  files?: File[];                // Archivos subidos
  teamByMinistry?: Record<string, { ministry: Ministry; members: ServiceTeamMember[] }>;
  _count?: { team: number; songs: number; files: number };  // Conteos
}

// ============================================
// INTERFAZ: ServiceSegment
// ============================================
// Qué: Un elemento del orden del culto
// Ejemplo: "Alabanza" (15 min), "Ofrenda" (5 min)
// Conecta: Con schema.prisma (model ServiceSegment)
export interface ServiceSegment {
  id: string;           // ID del segmento
  serviceId: string;    // FK: servicio
  order: number;        // Posición: 1=primero, 2=segundo
  title: string;        // Título: "Alabanza"
  durationMin?: number; // Duración estimada en minutos
  notes?: string;       // Notas del segmento
  ministry?: Ministry;  // Ministerio responsable
  responsible?: User;   // Persona responsable
}

// ============================================
// INTERFAZ: ServiceTeamMember
// ============================================
// Qué: Una persona asignada al servicio con su estado
// Conecta: Con schema.prisma (model ServiceTeam)
export interface ServiceTeamMember {
  id: string;           // ID de la asignación
  serviceId: string;    // FK: servicio
  userId: string;       // FK: persona
  ministryId: string;   // FK: ministerio
  ministryRoleId: string;  // FK: rol/instrumento
  status: 'pending' | 'confirmed' | 'cannot_attend' | 'schedule_conflict';
  note?: string;        // Nota: "Llego tarde"
  user?: User;          // Datos del usuario
  ministry?: Ministry;  // Ministerio
  ministryRole?: MinistryRole;  // Rol/instrumento
}

// ============================================
// INTERFAZ: Song
// ============================================
// Qué: Una canción del set list
// Conecta: Con schema.prisma (model Song)
export interface Song {
  id: string;           // ID de la canción
  serviceId: string;    // FK: servicio
  order: number;        // Posición en el set list
  title: string;        // Título: "Grande y Fuerte"
  key?: string;         // Tono: "C", "Dm"
  lyricsUrl?: string;   // URL de la letra
  sheetMusicUrl?: string;  // URL de la partitura
  youtubeLink?: string; // Link de YouTube
  updatedBy?: User;     // Quien actualizó
  updatedAt: string;    // Última actualización
}

// ============================================
// INTERFAZ: File
// ============================================
// Qué: Un archivo subido al servicio
// Conecta: Con schema.prisma (model File)
export interface File {
  id: string;           // ID del archivo
  serviceId: string;    // FK: servicio
  name: string;         // Nombre original
  type: string;         // Tipo: "pdf", "pptx"
  url: string;          // URL en S3
  size: number;         // Tamaño en bytes
  version: number;      // Versión (incrementa al re-subir)
  uploadedBy?: User;    // Quien subió
  ministry?: Ministry;  // Ministerio asociado
  createdAt: string;    // Fecha de subida
}

// ============================================
// INTERFAZ: Notification
// ============================================
// Qué: Una notificación para el usuario
// Conecta: Con schema.prisma (model Notification)
export interface Notification {
  id: string;           // ID de la notificación
  userId: string;       // FK: destinatario
  type: string;         // Tipo: "team_status_change", "song_key_change"
  message: string;      // Mensaje legible
  referenceId?: string; // ID del objeto referenciado
  referenceType?: string;  // Tipo: "service", "song"
  read: boolean;        // Si true, ya fue leída
  createdAt: string;    // Fecha de creación
}

// ============================================
// INTERFAZ: PositionRequest
// ============================================
// Qué: Solicitud de posición/instrumento
// Conecta: Con schema.prisma (model PositionRequest)
export interface PositionRequest {
  id: string;           // ID de la solicitud
  serviceId: string;    // FK: servicio
  status: 'pending' | 'accepted' | 'rejected';  // Estado
  ministryRole?: MinistryRole;  // Posición solicitada
  user?: User;          // Persona solicitada
}
