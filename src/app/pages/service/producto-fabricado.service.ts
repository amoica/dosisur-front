import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para tipar la estructura de los objetos
export interface SkidSectionItem {
  insumoId: number;
  cantidad: number;
  unidad: string;
  insumo?:{
    name: string;
    code: string;
    description:string;
  }
}

export interface SkidSection {
  nombre?: string;
  baseComponenteId?: number;
  items: SkidSectionItem[];
}

export interface ProductoFabricado {
  nombre: string;
  codigo: string;
  tipo: string;
  secciones: SkidSection[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductoFabricadoService {
  private apiUrl = 'http://localhost:3000/api/producto-fabricado';

  constructor(private http: HttpClient) { }

  // Crea un nuevo skid (producto fabricado)
  createSkid(skid: any): Observable<any> {
    for (let [key, value] of skid.entries()) {
      console.log(key, value);
    }    return this.http.post(this.apiUrl, skid);
  }

  // Obtiene todos los skids (con información básica)
  getSkids(): Observable<ProductoFabricado[]> {
    return this.http.get<ProductoFabricado[]>(this.apiUrl);
  }

  // Obtiene el detalle completo de un skid por ID
  getSkid(id: number): Observable<ProductoFabricado> {
    return this.http.get<ProductoFabricado>(`${this.apiUrl}/${id}`);
  }
}
