import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private apiUrl = 'http://localhost:3000/api/permissions'


  constructor(private http: HttpClient) { }

  getAllPermissions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createPermission(permissionData: any): Observable<any> {
    return this.http.post(this.apiUrl, permissionData);
  }

  updatePermission(dto: any): Observable<any>  {
    return this.http.get(this.apiUrl);

  }

  deletePermission(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}