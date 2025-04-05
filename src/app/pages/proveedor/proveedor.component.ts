import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Proveedor, ProveedorService, Contacto } from '../service/proveedor.service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.scss'],
  imports: [
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    FormsModule,
    CommonModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
})
export class ProveedorComponent implements OnInit {
  proveedores: Proveedor[] = []; 
  proveedorDialog: boolean = false; 
  viewDialog: boolean = false; 
  proveedor: Proveedor = {} as Proveedor; 
  submitted: boolean = false; 
  isEdit: boolean = false; 
  globalFilter: string = ''; 

  // Manejo de contactos
  contactoDialog: boolean = false; // para mostrar/ocultar modal de contacto
  contacto: Contacto = {} as Contacto; // contacto temporal
  isEditContacto: boolean = false; // modo edición de contacto

  constructor(
    private proveedorService: ProveedorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProveedores();
  }

  loadProveedores() {
    this.proveedorService.getProveedores().subscribe((data) => {
      this.proveedores = data;
    });
  }

  // Abrir modal para crear un nuevo proveedor
  openNew() {
    this.proveedor = {} as Proveedor;
    this.proveedor.contactos = []; // Iniciar sin contactos
    this.submitted = false;
    this.proveedorDialog = true;
    this.isEdit = false;
  }

  // Abrir modal para editar un proveedor existente
  editProveedor(proveedor: Proveedor) {
    this.proveedor = { ...proveedor };
    // Asegurarnos de que exista el array de contactos
    if (!this.proveedor.contactos) {
      this.proveedor.contactos = [];
    }
    this.proveedorDialog = true;
    this.isEdit = true;
  }

  // Abrir modal para visualizar un proveedor (solo lectura)
  viewProveedor(proveedor: Proveedor) {
    this.proveedor = { ...proveedor };
    this.viewDialog = true;
  }

  // Guardar proveedor (crear o editar)
  saveProveedor() {
    this.submitted = true;

    // Validaciones mínimas
    if (
      this.proveedor.nombre?.trim() &&
      this.proveedor.email?.trim() &&
      this.proveedor.telefono?.trim()
    ) {
      if (this.isEdit && this.proveedor.id) {
        // Actualizar
        this.proveedorService
          .updateProveedor(this.proveedor.id, this.proveedor)
          .subscribe(() => {
            this.loadProveedores();
            this.proveedorDialog = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Proveedor actualizado correctamente',
            });
          });
      } else {
        // Crear
        this.proveedorService.createProveedor(this.proveedor).subscribe(() => {
          this.loadProveedores();
          this.proveedorDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Proveedor creado correctamente',
          });
        });
      }
    }
  }

  hideDialog() {
    this.proveedorDialog = false;
    this.viewDialog = false;
    this.submitted = false;
  }

  // Confirmación y eliminación del proveedor
  deleteProveedor(proveedor: Proveedor) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar al proveedor "${proveedor.nombre}"?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (proveedor.id) {
          this.proveedorService.deleteProveedor(proveedor.id).subscribe(() => {
            this.proveedores = this.proveedores.filter((p) => p.id !== proveedor.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Proveedor eliminado correctamente',
            });
          });
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Eliminación cancelada',
        });
      },
    });
  }

  // ================================
  //     Manejo de contactos
  // ================================
  openNewContacto() {
    this.contacto = {} as Contacto;
    this.isEditContacto = false;
    this.contactoDialog = true;
  }

  editContacto(contacto: Contacto) {
    this.contacto = { ...contacto };
    this.isEditContacto = true;
    this.contactoDialog = true;
  }

  saveContacto() {
    // Validar un mínimo (nombre) para el contacto
    if (!this.contacto.nombre?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'El contacto debe tener un nombre',
      });
      return;
    }

    if (!this.proveedor.contactos) {
      this.proveedor.contactos = [];
    }

    if (this.isEditContacto) {
      // Editar existente
      const index = this.proveedor.contactos.findIndex(
        (c) => c.id === this.contacto.id
      );
      if (index !== -1) {
        this.proveedor.contactos[index] = { ...this.contacto };
      } else {
        // Si no encuentra el id, podría ser un contacto "temporal" que aún no se guardó en backend
        // Podríamos identificarlo de otra forma, o simplemente lo agregamos
        this.proveedor.contactos.push({ ...this.contacto });
      }
    } else {
      // Crear nuevo en el array
      // Podrías asignar un ID temporal negativo, etc. si necesitas distinguir
      this.proveedor.contactos.push({ ...this.contacto });
    }

    this.contactoDialog = false;
  }

  deleteContacto(contacto: Contacto) {
    // Lo quitamos del array local
    this.proveedor.contactos = this.proveedor.contactos?.filter(
      (c) => c !== contacto
    );
    // O podrías hacer una confirmación previa con ConfirmationService
  }

  hideContactoDialog() {
    this.contactoDialog = false;
  }

  goToDetail(proveedorId: number){
    console.log(proveedorId);
    this.router.navigate(['/gestion-proveedor', 'proveedor', proveedorId]);
  }
}