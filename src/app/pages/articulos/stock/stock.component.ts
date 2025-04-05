import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-stock',
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    ToastModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [MessageService],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent {
  stockItems = [
    {
      id: 1,
      name: 'Baterías Industriales',
      category: 'Energía',
      quantity: 20,
      status: 'En Stock',
      criticalLevel: 10,
      updated: new Date(),
    },
    {
      id: 2,
      name: 'Llaves Inglesas',
      category: 'Herramientas',
      quantity: 5,
      status: 'Bajo Stock',
      criticalLevel: 10,
      updated: new Date(),
    },
    {
      id: 3,
      name: 'Válvulas de Seguridad',
      category: 'Componentes',
      quantity: 40,
      status: 'En Stock',
      criticalLevel: 15,
      updated: new Date(),
    },
    {
      id: 4,
      name: 'Paneles Solares',
      category: 'Energía',
      quantity: 2,
      status: 'Crítico',
      criticalLevel: 5,
      updated: new Date(),
    },
  ];

  filteredStockItems = [...this.stockItems];
  selectedStockItem: any = null;
  modalVisible: boolean = false;
  searchTerm: string = '';

  constructor(private messageService: MessageService) {}

  filterStock() {
    const term = this.searchTerm.toLowerCase();
    this.filteredStockItems = this.stockItems.filter((item) =>
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.status.toLowerCase().includes(term)
    );
  }

  exportStock() {
    // Simulación de exportación: aquí podrías implementar lógica real con archivos
    this.messageService.add({
      severity: 'success',
      summary: 'Exportación Exitosa',
      detail: 'El inventario fue exportado correctamente.',
    });
  }

  showDetails(item: any) {
    this.selectedStockItem = item;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.selectedStockItem = null;
  }

  getStatusSeverity(
    status: string
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'En Stock':
        return 'success';
      case 'Bajo Stock':
        return 'warn';
      case 'Crítico':
        return 'danger';
      default:
        return 'info';
    }
  }
}