import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DepositoService {
  private baseUrl = 'http://localhost:3000/api/depositos'; // URL del backend

  constructor(private http: HttpClient) {}

  // Obtener todos los depósitos con paginación
  getDepositos(params: any): Observable<any> {
    return this.http.get(`${this.baseUrl}`, { params });
  }

  // Obtener un depósito por ID
  getDepositoById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo depósito
  createDeposito(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  // Actualizar un depósito existente
  updateDeposito(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, data);
  }

  // Eliminar (deshabilitar) un depósito
  deleteDeposito(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}