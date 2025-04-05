import { Component, EventEmitter, Input, Output } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { ProductoFabricado } from '../../service/producto-fabricado.service';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-skid-detail-dialog',
  templateUrl: './skid-detail-dialog.component.html',
  standalone:true,
  imports:[
    CommonModule,
    FormsModule,
    DialogModule,
    TableModule,
    DividerModule,
    ButtonModule],
  styleUrls: ['./skid-detail-dialog.component.scss'] // Opcional: estilos personalizados
})
export class SkidDetailDialogComponent {
  @Input() skid: ProductoFabricado | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  constructor() { }

  //** Método para cerrar el diálogo y emitir el cambio */
  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  /** Exporta la información del Skid a PDF utilizando jsPDF y autoTable */
  exportToPDF(): void {
    if (!this.skid) {
      return;
    }

    const doc = new jsPDF();
    // Título del PDF
    doc.setFontSize(18);
    doc.text('Detalle del Skid', 14, 22);

    // Datos generales
    doc.setFontSize(12);
    doc.text(`Nombre: ${this.skid.nombre}`, 14, 32);
    doc.text(`Código: ${this.skid.codigo}`, 14, 40);

    // Separador
    doc.line(14, 45, 196, 45);

    // Por cada sección, agregamos una tabla con los ítems
    let startY = 50;
    this.skid.secciones.forEach((seccion, index) => {
      doc.setFontSize(14);
      doc.text(`Sección ${index + 1}: ${seccion.nombre || ''}`, 14, startY);
      startY += 6;

      // Preparamos los datos para la tabla
      const columns = ['Insumo', 'Código', 'Cantidad', 'Unidad'];
      const rows = seccion.items.map(item => {
        const insumo = item.insumo;
        return [
          insumo?.name || 'N/A',
          insumo?.code || 'N/A',
          item.cantidad.toString()        ];
      });

      const res = autoTable(doc, {
        head: [columns],
        body: rows,
        startY: startY,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
      });
      startY = (doc as any).lastAutoTable.finalY + 10;
    });

    // Guarda el PDF con un nombre dinámico
    doc.save(`Skid_${this.skid.codigo}.pdf`);
  }
}