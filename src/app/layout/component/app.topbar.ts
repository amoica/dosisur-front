// app-topbar.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { StyleClassModule } from 'primeng/styleclass';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../pages/service/auth.service';
import { UserService } from '../../pages/service/user.service';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule, RouterModule, StyleClassModule, AppConfigurator,
    OverlayPanelModule, AvatarModule, TooltipModule, RippleModule,
    SkeletonModule, ToastModule
  ],
  providers: [MessageService],
  styles: [`
    .topbar-logo { width: 40px; height: 40px; border-radius: 8px; object-fit: contain; margin-right: .5rem; }
    .layout-topbar { display:flex; align-items:center; justify-content:space-between; }
    .layout-topbar-actions { display:flex; align-items:center; gap:.5rem; }

    .user-btn :deep(.p-avatar) { box-shadow: 0 2px 10px rgba(0,0,0,.1); }
    .user-panel { width: 280px; padding:.25rem; }
    .up-head { display:flex; align-items:center; gap:.75rem; padding:.5rem .5rem 0; }
    .up-head .name { font-weight:700; line-height:1.1; }
    .up-head .role { color: var(--text-color-secondary); font-size:.85rem; }

    .up-actions { display:flex; flex-direction:column; padding:.5rem; gap:.25rem; }
    .up-item {
      display:flex; align-items:center; gap:.6rem;
      padding:.55rem .65rem; border-radius:.6rem; background:transparent; border:none; width:100%; text-align:left;
      cursor:pointer; color: var(--text-color);
      transition: background .15s ease, transform .05s ease;
    }
    .up-item:hover { background: var(--surface-100); }
    .up-item i { width: 1.1rem; text-align:center; }
    .up-item .wip { margin-left:auto; font-size:.75rem; color: var(--text-color-secondary); }
    .up-item.exit { color: var(--red-500); }
  `],
  template: `
    <div class="layout-topbar">
      <!-- Left: menú + logo -->
      <div class="layout-topbar-logo-container">
        <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
          <i class="pi pi-bars"></i>
        </button>

        <a class="layout-topbar-logo" routerLink="/">
          <img
            src="assets/image/logo.jpg"
            alt="Dosisur Logo"
            class="topbar-logo" />
        </a>
      </div>

      <!-- Right: acciones + avatar -->
      <div class="layout-topbar-actions">
        <div class="layout-config-menu">
          <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()" pTooltip="Tema">
            <i class="pi" [ngClass]="{ 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
          </button>

          <div class="relative">
            <button
              class="layout-topbar-action layout-topbar-action-highlight"
              pStyleClass="@next"
              enterFromClass="hidden"
              enterActiveClass="animate-scalein"
              leaveToClass="hidden"
              leaveActiveClass="animate-fadeout"
              [hideOnOutsideClick]="true"
              pTooltip="Apariencia"
            >
              <i class="pi pi-palette"></i>
            </button>
            <app-configurator />
          </div>
        </div>

        <!-- Avatar / User menu -->
        <button class="layout-topbar-action user-btn" (click)="userPanel.toggle($event)" pTooltip="Cuenta" pRipple>
          <p-avatar
            [image]="meSnapshot?.avatarUrl || undefined"
            [label]="avatarInitials(meSnapshot)"
            shape="circle"
            size="large">
          </p-avatar>
        </button>

        <p-overlayPanel #userPanel [dismissable]="true" [showCloseIcon]="true" styleClass="user-panel">
          <ng-container *ngIf="me$ | async as me; else meSkel">
            <div class="up-head">
              <p-avatar [image]="me?.avatarUrl || undefined" [label]="avatarInitials(me)" shape="circle" size="large"></p-avatar>
              <div>
                <div class="name">{{ me?.firstName }} {{ me?.lastName }}</div>
                <div class="role">{{ me?.role || '—' }}</div>
              </div>
            </div>

            <div class="up-actions">
              <button class="up-item" type="button" (click)="comingSoon('Perfil')" pRipple>
                <i class="pi pi-user"></i> <span>Perfil</span> <span class="wip">en construcción</span>
              </button>
              <button class="up-item" type="button" (click)="comingSoon('Notificaciones')" pRipple>
                <i class="pi pi-bell"></i> <span>Notificaciones</span> <span class="wip">en construcción</span>
              </button>
              <button class="up-item exit" type="button" (click)="logout()" pRipple>
                <i class="pi pi-sign-out"></i> <span>Salir</span>
              </button>
            </div>
          </ng-container>

          <ng-template #meSkel>
            <p-skeleton width="240px" height="84px"></p-skeleton>
          </ng-template>
        </p-overlayPanel>
      </div>
    </div>

    <p-toast></p-toast>
  `
})
export class AppTopbar implements OnInit {
  layoutService = inject(LayoutService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toast = inject(MessageService);

  // stream del usuario; empieza con el snapshot por si ya está en memoria
  me$ = this.userService.meStream().pipe(startWith(this.userService.snapshot));
  get meSnapshot() { 
    return this.userService.snapshot; }

  ngOnInit(): void {
    // fallback por si el perfil aún no está en memoria (p.ej. refresh de página)
    if (!this.userService.snapshot) {
      this.userService.loadMe().subscribe();
    }
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((s) => ({ ...s, darkTheme: !s.darkTheme }));
  }

  comingSoon(feat: string) {
    this.toast.add({ severity: 'info', summary: feat, detail: 'En construcción', life: 2000 });
  }

  logout() {
    this.authService.logout();
  }

  avatarInitials(me: any): string | undefined {
    if (!me || me?.avatarUrl) return undefined;
    const a = (me.firstName || '').trim()[0] || '';
    const b = (me.lastName || '').trim()[0] || '';
    const label = (a + b).toUpperCase();
    return label || 'U';
  }
}
