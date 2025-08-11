import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../../core/app-config';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {


  private readonly cfg = inject<AppConfig>(APP_CONFIG);
  private apiUrl = `${this.cfg.apiUrl}/permission`;



  constructor(private http: HttpClient) { }

  getAllPermissions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createPermission(permissionData: any): Observable<any> {
    return this.http.post(this.apiUrl, permissionData);
  }

  updatePermission(dto: any): Observable<any> {
    return this.http.get(this.apiUrl);

  }

  deletePermission(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getMyPermissions() {
    return this.http.get<{ data: string[] }>(`${this.apiUrl}/me`); // apiUrl = .../permission
  }

  getAllowedRoutes$(): Observable<Set<string>> {
    return this.getMyPermissions().pipe(
      map(res => new Set(res?.data ?? []))
    );
  }

  getMyScopes$(): Observable<Set<string>> {
    return this.http.get<{ data: string[] }>(`${this.apiUrl}/me`).pipe(
      map(res => new Set((res?.data ?? []))) // vienen con "/" al inicio
    );
  }
}