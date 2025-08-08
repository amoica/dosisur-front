import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { MessageService, ConfirmationService } from 'primeng/api';

import { YacimientoService } from '../service/yacimiento.service';
import { ClienteService, Cliente } from '../service/cliente.service';
import { Yacimiento } from './yacimiento.interface';

@Component({
  selector: 'app-yacimiento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule
  ],
  templateUrl: './yacimiento.component.html',
  styleUrls: ['./yacimiento.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class YacimientoComponent implements OnInit {
  yacimientos: Yacimiento[] = [];
  clientes: Cliente[] = [];
  dialogVisible = false;
  isEdit = false;
  submitted = false;              // ← nueva bandera
  formData: Partial<Yacimiento> = {
    nombre: '',
    ubicacion: '',
    clienteId: undefined
  };

  constructor(
    private yacimientoService: YacimientoService,
    private clienteService: ClienteService,
    private msg: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    // Primero cargamos clientes, luego yacimientos para poder mapear
    this.loadClients();
  }

  private loadClients() {
    this.clienteService.getClientes().subscribe({
      next: data => {
        this.clientes = data;
        this.loadAll();  // ahora que tenemos clientes, cargamos yacimientos
      },
      error: err => this.showError('Error al cargar clientes', err)
    });
  }

  private loadAll() {
    this.yacimientoService.getAll().subscribe({
    next: data => {
      this.yacimientos = data.map(y => ({
        ...y,
        // find devuelve Cliente | undefined → compatible con cliente?
        cliente: this.clientes.find(c => c.id === y.clienteId)
      }));
    },
    error: err => this.showError('Error al cargar yacimientos', err)
  });
  }

  openNew() {
    this.isEdit = false;
    this.resetForm();
    this.submitted = false;       // ← reseteamos validaciones
    this.dialogVisible = true;
  }

  openEdit(item: Yacimiento) {
    this.isEdit = true;
    this.formData = { ...item };
    this.submitted = false;       // ← reseteamos validaciones
    this.dialogVisible = true;
  }

  save() {
    this.submitted = true;        // ← disparamos validaciones
    if (!this.formData.nombre || !this.formData.clienteId) {
      this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'Nombre y Cliente obligatorios' });
      return;
    }
    const obs = this.isEdit
      ? this.yacimientoService.update(this.formData.id!, this.formData as any)
      : this.yacimientoService.create(this.formData as any);

    obs.subscribe({
      next: () => {
        this.msg.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEdit ? 'Yacimiento actualizado' : 'Yacimiento creado'
        });
        this.loadAll();
        this.dialogVisible = false;
      },
      error: err => this.showError('Error al guardar yacimiento', err)
    });
  }

  delete(item: Yacimiento) {
    this.confirm.confirm({
      message: `¿Eliminar yacimiento "${item.nombre}"?`,
      accept: () => {
        this.yacimientoService.delete(item.id!).subscribe({
          next: () => {
            this.msg.add({ severity: 'warn', summary: 'Eliminado', detail: 'Yacimiento eliminado' });
            this.loadAll();
          },
          error: err => this.showError('Error al eliminar', err)
        });
      }
    });
  }

  hideDialog() {
    this.dialogVisible = false;
  }

  resetForm() {
    this.formData = { nombre: '', ubicacion: '', lat: undefined, lon: undefined, clienteId: undefined };
  }

  private showError(summary: string, err: any) {
    this.msg.add({ severity: 'error', summary, detail: err.message || 'Error desconocido' });
  }
}
