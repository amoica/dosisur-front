import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../../core/app-config';
import { Pedido } from '../../core/model/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenFabricacionService {

  private readonly cfg = inject<AppConfig>(APP_CONFIG);
  private apiUrl = `${this.cfg.apiUrl}/orden-fabricacion`;


  constructor(private http: HttpClient) { }


  createOrdenFabricacion(orden: any): Observable<any> {

    console.log(orden);
    return this.http.post(this.apiUrl, orden);
  }

  uploadOC(file: File) {
    const fd = new FormData();
    fd.append('fileOC', file);
    // opcional: metadata liviana (no sensible)
    // fd.append('meta', JSON.stringify({ module: 'pedido-cliente' }));
    return this.http.post<{ url: string }>(`${this.apiUrl}/oc/upload`, fd);
  }

  patchPedidoAdjunto(ordenId: number, url: string) {
    return this.http.patch(`${this.apiUrl}/${ordenId}/pedido/adjunto`, { adjunto: url });
  }



  getAllOrdenDeFabricacion(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getOrdenById(idPedido: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${idPedido}`)
  }

  updateOrden(id: number, orden: any): Observable<any> {
    console.log(orden);

    return this.http.patch(`${this.apiUrl}/${id}`, orden);
  }


}
