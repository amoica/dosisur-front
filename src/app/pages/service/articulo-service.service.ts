import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiPage } from '../../core/model/api.model';
import { map, Observable } from 'rxjs';
import { Articulo, ArticuloDto } from '../../core/model/articulo.model';
import { APP_CONFIG, AppConfig } from '../../core/app-config';


@Injectable({
  providedIn: 'root'
})
export class ArticuloServiceService {


  private readonly cfg = inject<AppConfig>(APP_CONFIG);
  private apiUrl = `${this.cfg.apiUrl}/insumos`;
  constructor(private http: HttpClient) { }


  // Helper: mapear DTO -> modelo con Date
  private toArticulo(dto: ArticuloDto): Articulo {
    return {
      ...dto,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
      insumoProveedor: dto.insumoProveedor?.map(ip => ({
        ...ip,
        fechaActualizacion:
          typeof ip.fechaActualizacion === 'string'
            ? new Date(ip.fechaActualizacion)
            : ip.fechaActualizacion
      })) ?? []
    };
  }

  // GET paginado
  getArticulos(params?: { page?: number; limit?: number; search?: string })
    : Observable<{ data: Articulo[]; meta: ApiPage<unknown>['meta'] }> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<ApiPage<ArticuloDto>>(this.apiUrl, { params: httpParams }).pipe(
      map(res => ({
        data: res.data.map(this.toArticulo.bind(this)),
        meta: res.meta
      }))
    );
  }



  getAllArticuleNotFilters(): Observable<Articulo[]> {
    return this.http
      .get<ApiPage<ArticuloDto>>(`${this.apiUrl}/notfilters`)
      .pipe(
        map(res => res.data.map(dto => this.toArticulo(dto)))
      );
  }


  getArticuloById(id: number) {
    return this.http.get(this.apiUrl + '/' + id);
  }


  getCategorias() {
    return this.http.get(`${this.apiUrl}/categoria`);

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
