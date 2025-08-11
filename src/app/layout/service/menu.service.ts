import { inject, Injectable } from '@angular/core';
import { GenericDataService } from '../../core/service/generic-data.service';
import { Menu } from 'primeng/menu';
import { map, Observable, shareReplay } from 'rxjs';
import { MenuModel } from '../model/menu.interface';
import { MenuItem } from 'primeng/api';
import { APP_CONFIG, AppConfig } from '../../core/app-config';

@Injectable({
  providedIn: 'root'
})
export class MenuService extends GenericDataService<Menu> {


  private readonly cfg = inject<AppConfig>(APP_CONFIG);
  protected apiUrl = `${this.cfg.apiUrl}/menu`;
  private normalizeRoute = (r: string) => (r?.startsWith('/') ? r : `/${r}`);

  getMenuModel(): Observable<MenuItem[]> {
    return this.http.get<MenuModel[]>(this.apiUrl).pipe(
      map(items => {
        const grouped = items.reduce<Record<string, MenuModel[]>>((acc, it) => {
          (acc[it.section || 'General'] = acc[it.section || 'General'] || []).push(it);
          return acc;
        }, {});
        return Object.entries(grouped).map(([section, list]) => ({
          label: section,
          items: list
            .sort((a, b) => a.order - b.order)
            .map(i => ({
              label: i.label,
              icon: i.icon,
              routerLink: [this.normalizeRoute(i.route)]
            }))
        }));
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getMenuRaw(): Observable<MenuModel[]> {
    return this.http.get<MenuModel[]>(this.apiUrl);
  }

}
