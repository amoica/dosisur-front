import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    imports: [CommonModule, TableModule, ButtonModule, DialogModule, RippleModule, FormsModule, ToastModule, ConfirmDialogModule],
    providers: [MessageService, ConfirmationService],
    template: `
  <p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>
    <div class="card !mb-8">
      <div class="font-semibold text-xl mb-4">Solicitudes Recientes</div>
      <p-table [value]="solicitudes" [paginator]="true" [rows]="5" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th>Tipo</th>
            <th>Detalle</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-solicitud>
          <tr>
            <td>{{ solicitud.tipo }}</td>
            <td>{{ solicitud.detalle }}</td>
            <td>{{ solicitud.fecha | date: 'short' }}</td>
            <td>
              <button
                pButton
                pRipple
                type="button"
                icon="pi pi-search"
                class="p-button p-component p-button-text p-button-icon-only"
                (click)="verSolicitud(solicitud)"
              ></button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Modal Detalle -->
      <p-dialog [(visible)]="modalVisible" [modal]="true" [closable]="false" [style]="{ width: '50vw' }">
        <ng-container *ngIf="solicitudSeleccionada">
          <div class="modal-header">
            <h2>Detalle de la Solicitud</h2>
            <button
              pButton
              pRipple
              icon="pi pi-times"
              class="p-button-text p-button-danger close-button"
              (click)="cerrarModal()"
            ></button>
          </div>
          <div class="modal-content">
            <p><strong>Tipo:</strong> {{ solicitudSeleccionada.tipo }}</p>
            <p><strong>Generado Por:</strong> {{ solicitudSeleccionada.generadoPor }}</p>
            <p><strong>Fecha:</strong> {{ solicitudSeleccionada.fecha | date: 'short' }}</p>
            <p><strong>Detalle:</strong> {{ solicitudSeleccionada.detalle }}</p>
            <p><strong>Estado:</strong> 
              <span
                class="status"
                [ngClass]="{
                  'status-pendiente': solicitudSeleccionada.estado === 'Pendiente',
                  'status-aprobado': solicitudSeleccionada.estado === 'Aprobado',
                  'status-rechazado': solicitudSeleccionada.estado === 'Rechazado',
                  'status-no-resuelto': solicitudSeleccionada.estado === 'No Resuelto'
                }"
              >
                {{ solicitudSeleccionada.estado }}
              </span>
            </p>
          </div>
          <div class="modal-actions">
            <button
              pButton
              label="Marcar como Pendiente"
              class="p-button-info"
              (click)="marcarPendiente()"
            ></button>
            <button
              pButton
              label="Rechazar"
              class="p-button-danger"
              (click)="rechazarSolicitud()"
            ></button>
            <button
              pButton
              label="Generar Cotización"
              *ngIf="solicitudSeleccionada.tipo === 'Cotización'"
              class="p-button-success"
              (click)="generarCotizacion()"
            ></button>
            <button
              pButton
              label="Generar Orden de Compra"
              *ngIf="solicitudSeleccionada.tipo === 'Orden de Compra'"
              class="p-button-warning"
              (click)="generarOrdenCompra()"
            ></button>
            <button
              pButton
              label="Ignorar"
              class="p-button-secondary"
              (click)="ignorarSolicitud()"
            ></button>
          </div>
        </ng-container>
      </p-dialog>
    </div>
  `,
    styles: [
        `
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--surface-border);
      }
      .modal-content p {
        margin: 0.5rem 0;
        font-size: 1rem;
        line-height: 1.5;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
      }
      .close-button {
        align-self: flex-start;
      }
      .status {
        font-weight: bold;
        padding: 0.3rem 0.5rem;
        border-radius: 4px;
      }
      .status-pendiente {
        background-color: #ffecb3;
        color: #f57c00;
      }
      .status-aprobado {
        background-color: #c8e6c9;
        color: #388e3c;
      }
      .status-rechazado {
        background-color: #ffcdd2;
        color: #d32f2f;
      }
      .status-no-resuelto {
        background-color: #ffe0b2;
        color: #ef6c00;
      }
    `,
    ],
})
export class RecentSalesWidget {
    solicitudes = [
        {
            id: 1,
            tipo: 'Cotización',
            detalle: 'Solicitud de cotización para baterías industriales.',
            fecha: new Date(),
            generadoPor: 'Juan Pérez',
            estado: 'Pendiente',
        },
        {
            id: 2,
            tipo: 'Orden de Compra',
            detalle: 'Orden de compra de válvulas de seguridad.',
            fecha: new Date(),
            generadoPor: 'María López',
            estado: 'Aprobado',
        },
        {
            id: 3,
            tipo: 'Stock Bajo',
            detalle: 'Stock crítico de "Llave Inglesa".',
            fecha: new Date(),
            generadoPor: 'Sistema',
            estado: 'No Resuelto',
        },
        {
            id: 4,
            tipo: 'Cotización',
            detalle: 'Solicitud de cotización para kits de herramientas.',
            fecha: new Date(),
            generadoPor: 'Carlos Gómez',
            estado: 'Rechazado',
        },
    ];

    modalVisible = false;
    solicitudSeleccionada: any = null;

    constructor(private messageService: MessageService) { }

    verSolicitud(solicitud: any) {
        this.solicitudSeleccionada = { ...solicitud };
        this.modalVisible = true;
    }

    cerrarModal() {
        this.modalVisible = false;
        this.solicitudSeleccionada = null;
    }

    marcarPendiente() {
        this.solicitudSeleccionada.estado = 'Pendiente';
        this.messageService.add({ severity: 'info', summary: 'Actualizado', detail: 'Solicitud marcada como pendiente.' });
        this.cerrarModal();
    }

    rechazarSolicitud() {
        this.solicitudSeleccionada.estado = 'Rechazado';
        this.messageService.add({ severity: 'error', summary: 'Rechazada', detail: 'Solicitud rechazada.' });
        this.cerrarModal();
    }

    generarCotizacion() {
        this.messageService.add({ severity: 'success', summary: 'Cotización Generada', detail: 'Cotización creada exitosamente.' });
        this.cerrarModal();
    }

    generarOrdenCompra() {
        this.messageService.add({ severity: 'success', summary: 'Orden Generada', detail: 'Orden de compra creada exitosamente.' });
        this.cerrarModal();
    }

    ignorarSolicitud() {
        this.solicitudes = this.solicitudes.filter((s) => s.id !== this.solicitudSeleccionada.id);
        this.messageService.add({ severity: 'info', summary: 'Ignorada', detail: 'La solicitud ha sido ignorada.' });
        this.cerrarModal();
    }
}