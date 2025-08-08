import { Injectable } from '@angular/core';
import { GenericDataService } from '../../core/service/generic-data.service';
import { Menu } from 'primeng/menu';
import { map, Observable } from 'rxjs';
import { MenuModel } from '../model/menu.interface';
import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class MenuService extends GenericDataService<Menu> {

    protected apiUrl = 'http://localhost:3000/api/menu';

    getMenuModel(): Observable<MenuItem[]> {
    return this.http.get<MenuModel[]>(this.apiUrl).pipe(
      map(items => {
        // Agrupar por sección
        const grouped = items.reduce<Record<string, MenuModel[]>>((acc, it) => {
          (acc[it.section] = acc[it.section] || []).push(it);
          return acc;
        }, {});

        // Mapear a la estructura que PrimeNG espera
        return Object.entries(grouped).map(([section, list]) => ({
          label: section,
          items: list
            .sort((a, b) => a.order - b.order)
            .map(i => ({
              label:      i.label,
              icon:       i.icon,
              routerLink: [i.route]
            }))
        }));
      })
    );
  }

}
