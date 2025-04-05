import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule, ProgressBarModule],
    template: `
    <div class="card low-stock-container">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div class="font-semibold text-xl">Artículos con Bajo Stock</div>
        <div>
          <button
            pButton
            type="button"
            icon="pi pi-ellipsis-v"
            class="p-button-rounded p-button-text p-button-plain"
            (click)="menu.toggle($event)"
          ></button>
          <p-menu #menu [popup]="true" [model]="menuItems"></p-menu>
        </div>
      </div>

      <!-- Lista de artículos -->
      <ul class="list-none p-0 m-0">
        <li *ngFor="let articulo of lowStockItems" class="low-stock-item">
          <!-- Detalles del artículo -->
          <div>
            <span class="text-primary font-medium block">{{ articulo.name }}</span>
            <span class="text-muted-color block">{{ articulo.category }}</span>
          </div>

          <!-- Barra de progreso -->
          <div class="stock-progress">
            <div class="progress-bar-wrapper">
              <p-progressBar [value]="articulo.stockPercentage"></p-progressBar>
            </div>
            <span class="text-danger ml-4 font-medium">{{ articulo.stock }} en stock</span>
          </div>
        </li>
      </ul>
    </div>
  `,
    styles: [
        `
      .low-stock-container {
        padding: 1.5rem;
        border-radius: 8px;
        background: white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }

      .low-stock-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
      }

      .low-stock-item:last-child {
        border-bottom: none;
      }

      .progress-bar-wrapper {
        width: 150px;
        margin-right: 1rem;
      }

      .text-primary {
        color: #007bff;
      }

      .text-danger {
        color: #dc3545;
      }

      .text-muted-color {
        color: #6c757d;
        font-size: 0.875rem;
      }

      .font-medium {
        font-weight: 500;
      }
    `,
    ],
})
export class BestSellingWidget {
    // Opciones del menú (acciones rápidas)
    menuItems = [
        { label: 'Reordenar Todo', icon: 'pi pi-fw pi-shopping-cart' },
        { label: 'Generar Informe', icon: 'pi pi-fw pi-file-pdf' },
        { label: 'Configurar Notificaciones', icon: 'pi pi-fw pi-cog' },
    ];

    // Datos simulados de artículos con bajo stock
    lowStockItems = [
        {
            id: 1,
            name: 'Tubo de PVC',
            category: 'Materiales de Construcción',
            stock: 5,
            stockPercentage: 5,
        },
        {
            id: 2,
            name: 'Llave Inglesa',
            category: 'Herramientas',
            stock: 12,
            stockPercentage: 12,
        },
        {
            id: 3,
            name: 'Compresor',
            category: 'Maquinaria',
            stock: 3,
            stockPercentage: 3,
        },
        {
            id: 4,
            name: 'Filtro de Aceite',
            category: 'Automotriz',
            stock: 8,
            stockPercentage: 8,
        },
        {
            id: 5,
            name: 'Manómetro',
            category: 'Instrumentos de Medición',
            stock: 10,
            stockPercentage: 10,
        },
    ];
}