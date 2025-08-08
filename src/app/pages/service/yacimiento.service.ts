import { Injectable } from '@angular/core';
import { GenericDataService } from '../../core/service/generic-data.service';
import { Yacimiento } from '../yacimiento/yacimiento.interface';

@Injectable({
  providedIn: 'root'
})
export class YacimientoService extends GenericDataService<Yacimiento>{

  protected apiUrl = 'http://localhost:3000/api/yacimiento';


  findByCliente(idCliente: number){
    return this.http.get<Yacimiento[]>(`${this.apiUrl}/cliente/${idCliente}`);
  }

}
