import { Role } from "../roles/role.interface";

export interface UserProfile {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  dni?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;    // si agregas avatar
}

/** Usuario completo (incluye perfil y rol) */
export interface User {
  id: number;
  email: string;
  roleId: number;
  role: Role;
  profile?: UserProfile;
  createBy?: number;  // quien lo creó (si lo manejas)
}