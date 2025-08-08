import { Permission } from "./permission.interface";

export interface Role {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  permissionIds?: number[];
}

export interface RoleForm {
  name: string;
  description: string;
  isSystem?: boolean;
}