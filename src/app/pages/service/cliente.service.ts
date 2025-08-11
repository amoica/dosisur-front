import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contacto } from './proveedor.service';
import { APP_CONFIG, AppConfig } from '../../core/app-config';

export interface Cliente {
  id?: number;
  nombre: string;
  email: string;
  telefono: string;
  celular?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  cuit?: string;
  condicionFiscal?: string;
  tipoCliente?: string;
  observaciones?: string;

  // Relación de contactos
  contactos?: Contacto[];
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

   private readonly cfg = inject<AppConfig>(APP_CONFIG);
    private apiUrl = `${this.cfg.apiUrl}/cliente`;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  updateCliente(id: number, cliente: Cliente): Observable<Cliente> {
    console.log(cliente);
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }


  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}