import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface Articulo {
  id: number;
  name: string;
  code: string;
  description: string;
  minimunStock: number;
  available: boolean;
  unidad: string,
  isInventoriable?: boolean;
  imagenUrl?: string;
  sinonimo?: string;
  updateAt?: Date;
  createdAt?: Date;
  categoria?: string | null;
  // … otros campos si los necesitas
  insumoProveedor?: Array<{
    proveedorId: number;
    codigoProveedor: string;
    precioUnitario?: number | null;
    fechaActualizacion: Date;
    // Si deseas, podrías tener una propiedad "proveedor" con los datos completos
    proveedor?: { id: number; nombre: string; /* … otros campos */ };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ArticuloServiceService {

  private apiUrl = 'http://localhost:3000/api/insumos';

  constructor(private http: HttpClient) { }

  getArticulos(page?: number, limit?: number, search?: string) {
    if (page && limit) {
      let params = new HttpParams()
        .set('page', page)
        .set('limit', limit);

      if (search) {
        params = params.set('search', search);
      }
      return this.http.get(this.apiUrl, { params });
    } else {
      return this.http.get(this.apiUrl);

    }
  }

  getAllArticuleNotFilters() {
    return this.http.get(`${this.apiUrl}/notfilters`);
  }

  getArticuloById(id: number) {
    return this.http.get(this.apiUrl + '/' + id);
  }

  createArticulo(articulo: any) {
    console.log(articulo);
    return this.http.post(this.apiUrl, articulo);
  }

  updateArticulo(idArticulo: string, articulo: any) {
    console.log(articulo);
    return this.http.patch(this.apiUrl + '/' + idArticulo, articulo);
  }

  deleteArticulo(id: number) {
    return this.http.delete(this.apiUrl + '/' + id);
  }

  getInsumos(params: { tipoInsumo: string; categoria?: string }) {
    const { tipoInsumo, categoria } = params;
    const query = new URLSearchParams({ tipoInsumo, ...(categoria ? { categoria } : {}) });
    return this.http.get<any[]>(`${this.apiUrl}/buscar/?${query.toString()}`);
  }

  toggleDisponibilidad() {
    //
  }
}
