import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdenFabricacionService {

  private apiUrl = 'http://localhost:3000/api/orden-fabricacion';

  constructor(private http: HttpClient) { }


  createOrdenFabricacion(orden: any): Observable<any> {
    return this.http.post(this.apiUrl, orden);
  }


  getAllOrdenDeFabricacion(): Observable<any>{
    return this.http.get<any[]>(this.apiUrl);
  }

  getOrdenById(idPedido: number){
    return this.http.get(`${this.apiUrl}/${idPedido}`)
  }

  updateOrden(id: number, orden: any): Observable<any> {
      console.log(orden);
    
    return this.http.patch(`${this.apiUrl}/${id}`, orden);
  }


}
