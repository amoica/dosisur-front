import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../../core/app-config';

export interface Contacto {
  id?: number;
  nombre: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  observaciones?: string;
}

export interface Proveedor {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  contactos?: Contacto[];
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  cuit?: string;
  condicionFiscal?: string;
  tipoProveedor?: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProveedorService {

    private readonly cfg = inject<AppConfig>(APP_CONFIG);
    private apiUrl = `${this.cfg.apiUrl}/proveedor`;
  
  constructor(private http: HttpClient) {}

  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  createProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.apiUrl, proveedor);
  }

  updateProveedor(id: number, proveedor: Proveedor): Observable<Proveedor> {
    return this.http.patch<Proveedor>(`${this.apiUrl}/${id}`, proveedor);
  }

  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}