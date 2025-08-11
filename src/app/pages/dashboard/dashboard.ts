import { Component } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { MegaDashboardComponent } from './components/megaDashboard';

@Component({
  selector: 'app-dashboard',
  imports: [ RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget, MegaDashboardComponent],
  template: `
    <app-mega-dashboard class="contents"></app-mega-dashboard>

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