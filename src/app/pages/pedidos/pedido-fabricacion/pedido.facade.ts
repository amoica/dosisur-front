// pedido.facade.ts
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, shareReplay, switchMap, startWith, of, Observable, filter, distinctUntilChanged, catchError } from 'rxjs';
import { OrdenFabricacionService } from '../../service/orden-fabricacion.service';
import { ProductoFabricadoService } from '../../service/producto-fabricado.service';
import { RecetaService } from '../../service/receta.service';
import { ArticuloServiceService } from '../../service/articulo-service.service';
import { Pedido } from '../../../core/model/pedido.model';

export type Option = { id: number; name: string };

export interface CatalogosVM {
  articulos: Option[];
  nameMap: Map<number, string>;
  panelOptions: Option[];
  bombaOptions: Option[];
  tableroOptions: Option[];
  instrumentoOptions: Option[];
  itemSize: number;
}

export interface PedidoVM extends CatalogosVM {
  loading: boolean;
  pedido: Pedido | null;
  skid: { nombre?: string; lts?: number; tipo?: string } | null;
}

@Injectable()
export class PedidoFacade {
  private route = inject(ActivatedRoute);
  private ordenSrv = inject(OrdenFabricacionService);
  private skidSrv = inject(ProductoFabricadoService);
  private recetaSrv = inject(RecetaService);
  private insumoSrv = inject(ArticuloServiceService);

  // 1) id$ SIEMPRE válido (>0) y sin convertir null -> 0
  readonly id$ = this.route.paramMap.pipe(
    map(pm => pm.get('id')),
    filter((id): id is string => !!id && id.trim().length > 0),
    map(id => Number(id)),
    filter(id => Number.isFinite(id) && id > 0),
    distinctUntilChanged(),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  // helper para des-envolver {data:...} o devolver tal cual
  private unwrap<T>(res: any): T {
    return (res && typeof res === 'object' && 'data' in res) ? res.data as T : res as T;
  }

  // 2) orden$ robusto (desenvuelve y atrapa errores)
  readonly orden$: Observable<Pedido | null> = this.id$.pipe(
    switchMap(id =>
      this.ordenSrv.getOrdenById(id).pipe(
        map(res => this.unwrap<Pedido>(res)),
        catchError(() => of(null))
      )
    ),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  // 3) skid$ solo si hay pedido y productoFabricadoId
  readonly skid$ = this.orden$.pipe(
    switchMap(o => (o && o.productoFabricadoId)
      ? this.skidSrv.getSkid(o.productoFabricadoId).pipe(
        map(res => this.unwrap<any>(res)),
        catchError(() => of(null))
      )
      : of(null)
    ),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  // 4) catálogos (tb desenvuelve si tu API retorna {data})
  readonly catalogos$: Observable<CatalogosVM> = combineLatest([
    this.insumoSrv.getArticulos().pipe(map(res => this.unwrap<any[]>(res)), catchError(() => of([]))),
    this.insumoSrv.getInsumos({ tipoInsumo: 'panel' }).pipe(catchError(() => of([]))),
    this.insumoSrv.getInsumos({ tipoInsumo: 'bomba' }).pipe(catchError(() => of([]))),
    this.recetaSrv.getRecetaByTipo('Tablero').pipe(map(res => this.unwrap<any[]>(res)), catchError(() => of([]))),
    this.recetaSrv.getRecetaByTipo('Instrumento').pipe(map(res => this.unwrap<any[]>(res)), catchError(() => of([]))),
  ]).pipe(
    map(([art, panel, bomba, tab, inst]) => {
      const articulos: Option[] = (art || []).map((a: any) => ({ id: a.id, name: a.name }));
      const nameMap = new Map(articulos.map(a => [a.id, a.name] as const));
      return {
        articulos,
        nameMap,
        panelOptions: panel,
        bombaOptions: bomba,
        tableroOptions: (tab || []).map((r: any) => ({ id: r.id, name: r.nombre })),
        instrumentoOptions: (inst || []).map((r: any) => ({ id: r.id, name: r.nombre })),
        itemSize: 36
      };
    }),
    startWith({
      articulos: [], nameMap: new Map(), panelOptions: [], bombaOptions: [],
      tableroOptions: [], instrumentoOptions: [], itemSize: 36
    }),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  // 5) VM: si orden/skid fallan, igual sacamos loading=false
  readonly vm$: Observable<PedidoVM> = combineLatest([this.orden$, this.skid$, this.catalogos$]).pipe(
    map(([pedido, skid, cats]) => ({ loading: false, pedido, skid, ...cats })),
    startWith({
      loading: true,
      pedido: null,
      skid: null,
      articulos: [], nameMap: new Map(), panelOptions: [], bombaOptions: [],
      tableroOptions: [], instrumentoOptions: [], itemSize: 36
    }),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  updateOrden(id: number, payload: any) { return this.ordenSrv.updateOrden(id, payload); }
  reloadOrden(id: number) { return this.ordenSrv.getOrdenById(id); } // si querés que actualice vm$, mejor gatillá un Subject refresh$

  uploadOC(file: File) {
    return this.ordenSrv.uploadOC(file);
  }

  setPedidoAdjunto(ordenId: number, url: string) {
    return this.ordenSrv.patchPedidoAdjunto(ordenId, url);
  }
}
