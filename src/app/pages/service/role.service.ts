// src/app/services/roles.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../roles/role.interface';
import { Permission } from '../roles/permission.interface';
import { APP_CONFIG, AppConfig } from '../../core/app-config';

@Injectable({ providedIn: 'root' })
export class RolesService {


  private readonly cfg = inject<AppConfig>(APP_CONFIG);
  private base = `${this.cfg.apiUrl}`;

  constructor(private http: HttpClient) { }

  /** Roles */
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.base}/roles`);
  }
  createRole(role: Partial<Role>): Observable<Role> {
    console.log(role);
    return this.http.post<Role>(`${this.base}/roles`, role);
  }
  updateRole(id: number, role: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.base}/roles/${id}`, role);
  }

  /** Permisos */
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.base}/permission`);
  }
  getPermissionsByRole(roleId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.base}/permission/${roleId}`);
  }
}