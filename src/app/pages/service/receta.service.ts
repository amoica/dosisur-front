import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Articulo } from './articulo-service.service';

export interface Receta {
  id?: number;
  nombre: string;
  codigo: string;
  tipo?: string;
  componentes: Array<{
    insumoId: number;
    cantidad: number;
    insumo?: {
      name:string;
      code:string;
      unidad:number
    };
  }>
}

export interface RecetaArticulo extends Articulo {
  // Estos campos se utilizarán únicamente cuando el artículo se agrega a una receta
  quantity: number;
}


@Injectable({
  providedIn: 'root'
})
export class RecetaService {

  private apiUrl = 'http://localhost:3000/api/receta'; // Ajusta la URL a la de tu API

  constructor(private http: HttpClient) { }

  // Obtiene el listado de recetas
  getRecetas(): Observable<Receta[]> {
    return this.http.get<Receta[]>(this.apiUrl);
  }

  // Obtiene una receta por su id
  getRecetaById(id: number): Observable<Receta> {
    return this.http.get<Receta>(`${this.apiUrl}/${id}`);
  }

  // Crea una nueva receta
  createReceta(receta: Receta | FormData): Observable<Receta> {

    console.log(receta);
    return this.http.post<Receta>(this.apiUrl, receta);
  }

  getRecetaByTipo(tipo: string): Observable<Receta[]> {
    return this.http.get<Receta[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  // Actualiza una receta existente
  updateReceta(receta: Receta): Observable<Receta> {
    const {id, ...updateReceta} = receta; 
    
    return this.http.patch<Receta>(`${this.apiUrl}/${id}`, updateReceta);
  }

  // Elimina una receta
  deleteReceta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
