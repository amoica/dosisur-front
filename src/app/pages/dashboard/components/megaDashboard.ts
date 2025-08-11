import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';

// PrimeNG
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TabViewModule } from 'primeng/tabview';
import { RippleModule } from 'primeng/ripple';

// Servicios
import { MenuService } from '../../../layout/service/menu.service';
import { PermissionService } from '../../service/permission.service';
import { UserService } from '../../service/user.service';

type DashItem = {
  key: string;          // route único
  label: string;
  icon?: string;
  route: string;
  section: string;
  allowed: boolean;
  favorite?: boolean;
};

type VM = {
  loading: boolean;
  sections: { name: string; items: DashItem[] }[];
  total: number;
  favorites: DashItem[];
};

@Component({
  standalone: true,
  selector: 'app-mega-dashboard',
  imports: [
    CommonModule, FormsModule,
    CardModule, SkeletonModule, TooltipModule, ToastModule,
    InputTextModule, ToggleButtonModule, TabViewModule, RippleModule
  ],
  providers: [MessageService],
  template: `
  <div class="mdash">
    <!-- Hero -->
    <header class="hero">
      <div class="uwrap" *ngIf="me$ | async as me; else meSkel">
        <div class="avatar-wrap">
          <ng-container *ngIf="!avatarBroken && me?.avatarUrl; else fallbackAvatar">
            <img class="avatar" [src]="me.avatarUrl" (error)="onAvatarError()" [alt]="(me.firstName || '') + ' ' + (me.lastName || '')"/>
          </ng-container>
          <ng-template #fallbackAvatar>
            <div class="avatar-fallback">
              <i class="pi pi-user"></i>
            </div>
          </ng-template>
        </div>
        <div class="uinfo">
          <div class="hello">Bienvenido{{ me.lastName ? ',' : '' }} {{ me.lastName || '' }} {{ me.firstName || '' }}</div>
          <div class="muted">{{ me.role || '—' }} · {{ me.email || '' }}</div>
        </div>
      </div>
      <ng-template #meSkel>
        <div class="uwrap">
          <div class="avatar-fallback"><i class="pi pi-user"></i></div>
          <div class="uinfo">
            <p-skeleton width="220px" height="16px" styleClass="mb-2"></p-skeleton>
            <p-skeleton width="180px" height="12px"></p-skeleton>
          </div>
        </div>
      </ng-template>

      <!-- Herramientas -->
      <div class="tools">
        <span class="p-input-icon-left search">
          <i class="pi pi-search"></i>
          <input pInputText [(ngModel)]="search" (ngModelChange)="search$.next($event)" placeholder="Buscar módulos..." />
        </span>
        <p-toggleButton
          onLabel="Solo con acceso"
          offLabel="Ver todo"
          [(ngModel)]="onlyAllowed"
          (ngModelChange)="onlyAllowed$.next($event)">
        </p-toggleButton>
      </div>
    </header>

    <!-- VM -->
    <ng-container *ngIf="ui$ | async as ui">
      <!-- Loading -->
      <ng-container *ngIf="ui.loading; else content">
        <div class="skeleton-row" *ngFor="let _ of [1,2]">
          <div class="s-head">
            <p-skeleton width="200px" height="20px"></p-skeleton>
          </div>
          <div class="grid">
            <div class="card-skel" *ngFor="let __ of [1,2,3,4,5,6,7,8]">
              <p-skeleton width="56px" height="56px" styleClass="mb-2"></p-skeleton>
              <p-skeleton width="70%" height="14px"></p-skeleton>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Contenido -->
      <ng-template #content>
        <p-tabView>
          <!-- ⭐ Favoritos -->
          <p-tabPanel *ngIf="ui.favorites?.length" header="⭐ Favoritos">
            <div class="grid">
              <article
                class="tile grad-fav"
                *ngFor="let it of ui.favorites; trackBy: trackByRoute"
                [class.locked]="!it.allowed"
                pRipple
                pTooltip="{{ it.allowed ? 'Entrar' : 'Sin permiso' }}"
                tooltipPosition="top"
                (click)="onOpen(it)"
              >
                <div class="icon">
                  <i [ngClass]="it.icon || 'pi pi-folder'"></i>
                  <i class="lock pi" [ngClass]="it.allowed ? 'pi-unlock' : 'pi-lock'"></i>
                </div>
                <div class="label">{{ it.label }}</div>
                <button type="button" class="star" (click)="toggleFav(it, $event)" pRipple pTooltip="Quitar de favoritos">
                  <i class="pi pi-star-fill"></i>
                </button>
              </article>
            </div>
          </p-tabPanel>

          <!-- Secciones -->
          <p-tabPanel *ngFor="let sec of ui.sections" [header]="sec.name">
            <div class="grid">
              <article
                class="tile"
                *ngFor="let it of sec.items; trackBy: trackByRoute"
                [class.locked]="!it.allowed"
                [ngClass]="colorClassFor(sec.name)"
                pRipple
                pTooltip="{{ it.allowed ? 'Entrar' : 'Sin permiso' }}"
                tooltipPosition="top"
                (click)="onOpen(it)"
              >
                <div class="icon">
                  <i [ngClass]="it.icon || 'pi pi-folder'"></i>
                  <i class="lock pi" [ngClass]="it.allowed ? 'pi-unlock' : 'pi-lock'"></i>
                </div>
                <div class="label">{{ it.label }}</div>
                <button type="button" class="star" (click)="toggleFav(it, $event)" pRipple
                        [pTooltip]="it.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'">
                  <i class="pi" [ngClass]="it.favorite ? 'pi-star-fill' : 'pi-star'"></i>
                </button>
              </article>
            </div>
          </p-tabPanel>
        </p-tabView>
      </ng-template>
    </ng-container>

    <p-toast></p-toast>
  </div>
  `,
  styles: [`
    /* Contenedor principal */
    .mdash { max-width:1200px; margin:0 auto; padding:1.25rem; display:flex; flex-direction:column; gap:1rem; }

    /* HERO */
    .hero {
      background: linear-gradient(135deg, var(--surface-100), var(--surface-200));
      border-radius: 18px; padding: 1rem 1.25rem;
      display:flex; align-items:center; justify-content:space-between; gap:1rem;
      box-shadow: 0 4px 24px rgba(0,0,0,.06);
    }
    .uwrap { display:flex; align-items:center; gap:.85rem; min-height:56px; }
    .avatar-wrap { position:relative; }
    .avatar {
      width:48px; height:48px; border-radius:50%; object-fit:cover;
      box-shadow: 0 2px 10px rgba(0,0,0,.12); background: var(--surface-0);
    }
    .avatar-fallback {
      width:48px; height:48px; border-radius:50%; display:grid; place-items:center;
      background: var(--primary-50); color: var(--primary-700);
      box-shadow: 0 2px 10px rgba(0,0,0,.12);
      font-size: 1.1rem;
    }
    .uinfo .hello { font-weight:800; letter-spacing:.2px; }
    .muted { color: var(--text-color-secondary); }

    .tools { display:flex; align-items:center; gap:.75rem; }
    .search { min-width: 260px; }

    /* Skeletons */
    .skeleton-row { display:flex; flex-direction:column; gap:.75rem; }
    .s-head { padding-left:.25rem; }

    /* Grid de tarjetas */
    .grid { display:grid; gap:1rem; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); }

    /* Tarjeta (tile) */
    .tile {
      position:relative; isolation:isolate; overflow:hidden;
      background: var(--surface-card); color: var(--text-color);
      border-radius:16px; padding:1.1rem 1rem; min-height:150px;
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.6rem;
      text-align:center; box-shadow:0 1px 8px rgba(0,0,0,.06);
      cursor:pointer; user-select:none;
      transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease, filter .18s ease;
    }
    .tile:hover { transform: translateY(-3px); box-shadow:0 14px 32px rgba(0,0,0,.12); }
    .tile.locked { opacity:.55; filter: grayscale(.15); cursor:not-allowed; }
    .tile.locked:hover { transform:none; box-shadow:0 1px 8px rgba(0,0,0,.06); }

    /* Icono circular */
    .icon {
      width:64px; height:64px; border-radius:50%;
      display:grid; place-items:center;
      background: rgba(255,255,255,.18);
      color:#fff; font-size:1.35rem;
      position:relative;
      backdrop-filter: saturate(140%) blur(2px);
    }
    .icon i { line-height:1; }
    .icon .lock {
      position:absolute; right:-6px; top:-6px;
      width:24px; height:24px; border-radius:50%;
      display:grid; place-items:center;
      background: var(--surface-0);
      color: var(--text-color);
      box-shadow:0 2px 8px rgba(0,0,0,.15);
      font-size:.9rem;
    }
    .label { font-weight:800; letter-spacing:.2px; }

    /* Botón de favorito */
    .star {
      position:absolute; left:10px; top:10px;
      width:30px; height:30px; border:none; outline:none; border-radius:50%;
      background: rgba(255,255,255,.85); color: var(--text-color);
      display:grid; place-items:center; box-shadow: 0 2px 10px rgba(0,0,0,.1);
      cursor:pointer;
    }
    .star i { font-size:.95rem; }
    .star:hover { filter: brightness(0.98); }

    /* Gradientes (compatibles con Sakai) */
    .grad-fav      { background: linear-gradient(135deg,#ffd166,#ef476f); color:#fff; }
    .grad-general  { background: linear-gradient(135deg,#7aa2f7,#6ee7b7); color:#fff; }
    .grad-gestion  { background: linear-gradient(135deg,#34d399,#06b6d4); color:#fff; }
    .grad-entidades{ background: linear-gradient(135deg,#a78bfa,#60a5fa); color:#fff; }
    .grad-seguridad{ background: linear-gradient(135deg,#f59e0b,#ef4444); color:#fff; }
    .grad-reportes { background: linear-gradient(135deg,#38bdf8,#818cf8); color:#fff; }

    /* Responsive */
    @media (max-width: 780px) {
      .hero { flex-direction:column; align-items:stretch; gap:.75rem; }
      .tools { justify-content:space-between; }
      .search { flex:1; }
      .grid { grid-template-columns: repeat(2,1fr); }
    }
  `]
})
export class MegaDashboardComponent implements OnInit {
  private readonly menuSvc = inject(MenuService);
  private readonly permSvc = inject(PermissionService);
  private readonly router = inject(Router);
  private readonly toast = inject(MessageService);
  private userSvc = inject(UserService);

  // UI state
  search = '';
  onlyAllowed = true;
  private favKey = 'mdash:favs';
  avatarBroken = false;

  // subjects UI
  search$ = new BehaviorSubject<string>('');
  onlyAllowed$ = new BehaviorSubject<boolean>(true);
  private favs$ = new BehaviorSubject<Set<string>>(this.loadFavs());

  private normalizeRoute = (r: string) => r?.startsWith('/') ? r : `/${r}`;
  private normalizeScope = (s: string) => s?.startsWith('/') ? s : `/${s}`;

  ngOnInit() {
    if (!this.userSvc.snapshot) {
      this.userSvc.loadMe().subscribe();
    }
  }

  // VM base (menú + permisos)
  private base$ = combineLatest([
    this.menuSvc.getMenuRaw(),     // [{ label, icon, route, section, order, permissionName? }]
    this.permSvc.getMyScopes$(),   // Set<string>
  ]).pipe(
    map(([raw, allowedSet]) => {
      const allowed = new Set(Array.from(allowedSet).map(this.normalizeScope));
      const bySection = new Map<string, DashItem[]>();

      (raw || [])
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((i: any) => {
          const route = this.normalizeRoute(String(i.route || ''));
          const perm = i.permissionName || i.permission?.name || '';
          const ok = perm ? allowed.has(this.normalizeScope(perm)) : true;

          const item: DashItem = {
            key: route,
            label: i.label,
            icon: i.icon,
            route,
            section: i.section || 'General',
            allowed: ok
          };

          const arr = bySection.get(item.section) || [];
          arr.push(item);
          bySection.set(item.section, arr);
        });

      const sections = Array.from(bySection.entries()).map(([name, items]) => ({ name, items }));
      const total = sections.reduce((acc, s) => acc + s.items.length, 0);
      return { loading: false, sections, total, favorites: [] } as VM;
    }),
    startWith({ loading: true, sections: [], total: 0, favorites: [] } as VM)
  );

  // UI derivado (filtros + favoritos)
  ui$ = combineLatest([this.base$, this.search$, this.onlyAllowed$, this.favs$]).pipe(
    map(([vm, q, onlyAllowed, favs]) => {
      if (vm.loading) return vm;

      const qn = (q || '').trim().toLowerCase();

      const filterItems = (items: DashItem[]) => items
        .filter(i => (onlyAllowed ? i.allowed : true))
        .filter(i => (qn ? i.label.toLowerCase().includes(qn) || i.route.toLowerCase().includes(qn) : true))
        .map(i => ({ ...i, favorite: favs.has(i.key) }));

      const allItems = vm.sections.flatMap(s => s.items);
      const favorites = filterItems(allItems).filter(i => i.favorite);

      const sections = vm.sections
        .map(s => ({ name: s.name, items: filterItems(s.items) }))
        .filter(s => s.items.length);

      return { ...vm, sections, favorites };
    })
  );

  // datos del usuario
  me$ = this.userSvc.meStream().pipe(startWith(this.userSvc.snapshot));

  trackByRoute = (_: number, it: DashItem) => it.route;

  onOpen(it: DashItem) {
    if (!it.allowed) {
      this.toast.add({ severity: 'warn', summary: 'Acceso restringido', detail: `No tenés permisos para "${it.label}".`, life: 2200 });
      return;
    }
    this.router.navigate([it.route]);
  }

  toggleFav(it: DashItem, ev: MouseEvent) {
    ev.stopPropagation();
    const next = new Set(this.favs$.value);
    next.has(it.key) ? next.delete(it.key) : next.add(it.key);
    this.favs$.next(next);
    this.saveFavs(next);
  }

  colorClassFor(section: string) {
    const s = (section || '').toLowerCase();
    if (s.includes('seguridad')) return 'grad-seguridad';
    if (s.includes('reporte')) return 'grad-reportes';
    if (s.includes('entidad') || s.includes('clientes') || s.includes('prove')) return 'grad-entidades';
    if (s.includes('gestión') || s.includes('general')) return 'grad-gestion';
    return 'grad-general';
  }

  onAvatarError() { this.avatarBroken = true; }

  private loadFavs() {
    try { return new Set<string>(JSON.parse(localStorage.getItem(this.favKey) || '[]')); }
    catch { return new Set<string>(); }
  }
  private saveFavs(s: Set<string>) {
    localStorage.setItem(this.favKey, JSON.stringify(Array.from(s)));
  }
}
