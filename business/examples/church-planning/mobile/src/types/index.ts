export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
}

export interface Ministry {
  id: string;
  name: string;
  isActive: boolean;
  roles?: MinistryRole[];
  _count?: { userMinistryRoles: number };
}

export interface MinistryRole {
  id: string;
  name: string;
  ministryId: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  status: 'planned' | 'confirmed' | 'finished';
  notes?: string;
  createdBy: string;
  segments?: ServiceSegment[];
  team?: ServiceTeamMember[];
  songs?: Song[];
  files?: File[];
  teamByMinistry?: Record<string, { ministry: Ministry; members: ServiceTeamMember[] }>;
  _count?: { team: number; songs: number; files: number };
}

export interface ServiceSegment {
  id: string;
  serviceId: string;
  order: number;
  title: string;
  durationMin?: number;
  notes?: string;
  ministry?: Ministry;
  responsible?: User;
}

export interface ServiceTeamMember {
  id: string;
  serviceId: string;
  userId: string;
  ministryId: string;
  ministryRoleId: string;
  status: 'pending' | 'confirmed' | 'cannot_attend' | 'schedule_conflict';
  note?: string;
  user?: User;
  ministry?: Ministry;
  ministryRole?: MinistryRole;
}

export interface Song {
  id: string;
  serviceId: string;
  order: number;
  title: string;
  key?: string;
  lyricsUrl?: string;
  sheetMusicUrl?: string;
  youtubeLink?: string;
  updatedBy?: User;
  updatedAt: string;
}

export interface File {
  id: string;
  serviceId: string;
  name: string;
  type: string;
  url: string;
  size: number;
  version: number;
  uploadedBy?: User;
  ministry?: Ministry;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  read: boolean;
  createdAt: string;
}

export interface PositionRequest {
  id: string;
  serviceId: string;
  status: 'pending' | 'accepted' | 'rejected';
  ministryRole?: MinistryRole;
  user?: User;
}
