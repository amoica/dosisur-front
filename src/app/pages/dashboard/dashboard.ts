import { Component } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { DashboardWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
  template: `
    <app-mega-dashboard class="contents"></app-mega-dashboard>

    <div class="section-title">
      <h2 class="section-heading">Visión General del Día</h2>
      <p class="section-subtitle">
        Aquí encontrarás un resumen de las actividades recientes, solicitudes y métricas clave para mantenerte al día.
      </p>
    </div>

    <div class="grid grid-cols-12 gap-8">
      <div class="col-span-12 xl:col-span-6">
        <app-recent-sales-widget></app-recent-sales-widget>
        <app-best-selling-widget></app-best-selling-widget>
      </div>
      <div class="col-span-12 xl:col-span-6">
        <app-revenue-stream-widget></app-revenue-stream-widget>
        <app-notifications-widget></app-notifications-widget>
      </div>
    </div>
  `,
  styles: [
    `
      .section-title {
        text-align: center;
        margin: 2rem 0;
      }

      .section-heading {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--primary-color);
      }

      .section-subtitle {
        font-size: 1.1rem;
        color: var(--text-secondary-color);
        margin-top: 0.5rem;
      }

      .grid {
        margin-top: 2rem;
      }
    `,
  ],
})
export class Dashboard {}