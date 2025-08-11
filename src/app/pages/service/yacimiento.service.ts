import { inject, Injectable } from '@angular/core';
import { GenericDataService } from '../../core/service/generic-data.service';
import { Yacimiento } from '../yacimiento/yacimiento.interface';
import { APP_CONFIG, AppConfig } from '../../core/app-config';

@Injectable({
  providedIn: 'root'
})
export class YacimientoService extends GenericDataService<Yacimiento> {


  private readonly cfg = inject<AppConfig>(APP_CONFIG);
  protected apiUrl = `${this.cfg.apiUrl}/yacimiento`;



  findByCliente(idCliente: number) {
    return this.http.get<Yacimiento[]>(`${this.apiUrl}/cliente/${idCliente}`);
  }

}
