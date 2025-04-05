import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [ButtonModule, MenuModule, CommonModule],
    template: `
    <div class="card notifications-container">
      <!-- Header de notificaciones -->
      <div class="flex items-center justify-between mb-4">
        <div class="font-semibold text-xl">Notificaciones</div>
        <div>
          <button
            pButton
            type="button"
            icon="pi pi-ellipsis-v"
            class="p-button-rounded p-button-text p-button-plain"
            (click)="menu.toggle($event)"
          ></button>
          <p-menu #menu [popup]="true" [model]="items"></p-menu>
        </div>
      </div>

      <!-- Notificaciones de hoy -->
      <span class="section-title">Hoy</span>
      <ul class="notifications-list">
        <li *ngFor="let notification of notificationsToday" class="notification-item">
          <div
            class="icon-container"
            [ngStyle]="{ 'background-color': notification.color + '20' }"
          >
            <i class="pi" [ngClass]="notification.icon" [style.color]="notification.color"></i>
          </div>
          <div>
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-detail">{{ notification.detail }}</div>
          </div>
        </li>
      </ul>

      <!-- Notificaciones de ayer -->
      <span class="section-title">Ayer</span>
      <ul class="notifications-list">
        <li *ngFor="let notification of notificationsYesterday" class="notification-item">
          <div
            class="icon-container"
            [ngStyle]="{ 'background-color': notification.color + '20' }"
          >
            <i class="pi" [ngClass]="notification.icon" [style.color]="notification.color"></i>
          </div>
          <div>
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-detail">{{ notification.detail }}</div>
          </div>
        </li>
      </ul>

      <!-- Notificaciones de la semana pasada -->
      <span class="section-title">Semana pasada</span>
      <ul class="notifications-list">
        <li *ngFor="let notification of notificationsLastWeek" class="notification-item">
          <div
            class="icon-container"
            [ngStyle]="{ 'background-color': notification.color + '20' }"
          >
            <i class="pi" [ngClass]="notification.icon" [style.color]="notification.color"></i>
          </div>
          <div>
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-detail">{{ notification.detail }}</div>
          </div>
        </li>
      </ul>
    </div>
  `,
    styles: [
        `
      .notifications-container {
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        background-color: white;
      }

      .section-title {
        font-size: 1rem;
        font-weight: bold;
        color: #444;
        margin-bottom: 0.5rem;
        display: block;
      }

      .notifications-list {
        list-style: none;
        padding: 0;
        margin: 0 0 1.5rem;
      }

      .notification-item {
        display: flex;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
      }

      .notification-item:last-child {
        border-bottom: none;
      }

      .icon-container {
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        margin-right: 1rem;
      }

      .notification-title {
        font-size: 1rem;
        font-weight: bold;
        color: #333;
      }

      .notification-detail {
        font-size: 0.875rem;
        color: #666;
      }
    `,
    ],
})
export class NotificationsWidget {
    items = [
        { label: 'Marcar todo como leído', icon: 'pi pi-fw pi-check' },
        { label: 'Configuraciones', icon: 'pi pi-fw pi-cog' },
        { label: 'Eliminar todo', icon: 'pi pi-fw pi-trash' },
    ];

    notificationsToday = [
        {
            icon: 'pi pi-box',
            color: '#007bff', // Azul
            title: 'Nueva solicitud de ajuste de stock',
            detail: 'Se ha solicitado un ajuste en el depósito central.',
        },
        {
            icon: 'pi pi-exclamation-circle',
            color: '#ffc107', // Amarillo
            title: 'Stock bajo en Tubo de PVC',
            detail: 'Quedan solo 5 unidades disponibles en el Depósito Norte.',
        },
    ];

    notificationsYesterday = [
        {
            icon: 'pi pi-thumbs-up',
            color: '#28a745', // Verde
            title: 'Orden de Fabricación aprobada',
            detail: 'Se aprobó la orden de fabricación para "Kit Solar".',
        },
        {
            icon: 'pi pi-clock',
            color: '#6f42c1', // Morado
            title: 'Trabajo de Campo pendiente',
            detail: 'Pendiente inicio para "Instalación de riego".',
        },
    ];

    notificationsLastWeek = [
        {
            icon: 'pi pi-check-circle',
            color: '#28a745', // Verde
            title: 'Movimiento completado',
            detail: 'Se completó el movimiento de stock al Depósito Sur.',
        },
        {
            icon: 'pi pi-chart-line',
            color: '#6f42c1', // Morado
            title: 'Informe de actividad',
            detail: 'Se generó un informe de actividad semanal.',
        },
    ];
}