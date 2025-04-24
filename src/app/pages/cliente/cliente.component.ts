import { Component, OnInit } from '@angular/core';

import { ConfirmationService, MessageService } from 'primeng/api';
import { Cliente, ClienteService } from '../service/cliente.service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { Contacto } from '../service/proveedor.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss'],
  imports: [
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    FormsModule,
    CommonModule,
    ToastModule,
    CardModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class ClienteComponent implements OnInit {
  clientes: Cliente[] = []; 
  clienteDialog: boolean = false; 
  contactoDialog: boolean = false; 
  cliente: Cliente = {} as Cliente; 
  submitted: boolean = false; 
  isEdit: boolean = false; 
  globalFilter: string = ''; 

  // Contacto temporal
  contacto: Contacto = {} as Contacto;
  isEditContacto: boolean = false;

  constructor(
    private clienteService: ClienteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.clienteService.getClientes().subscribe((data) => {
      this.clientes = data;
    });
  }

  openNew() {
    this.cliente = { nombre: '', email: '', telefono: '', contactos: [] }; // Inicializar array de contactos
    this.submitted = false;
    this.clienteDialog = true;
    this.isEdit = false;
  }

  editCliente(cliente: Cliente) {
    this.cliente = { ...cliente };
    // Asegurarnos de que exista el array de contactos
    if (!this.cliente.contactos) {
      this.cliente.contactos = [];
    }
    this.clienteDialog = true;
    this.isEdit = true;
  }

  goToDetail(clienteId: number) {
    // Ir a la vista de detalle (similar a /gestion-clientes/cliente/:id).
    this.router.navigate(['/gestion-clientes', 'cliente', clienteId]);
  }

  saveCliente() {
    this.submitted = true;

    // Validar campos principales
    if (this.cliente.nombre?.trim() && this.cliente.email?.trim() && this.cliente.telefono?.trim()) {
      if (this.isEdit && this.cliente.id) {
        // Actualizar
        this.clienteService.updateCliente(this.cliente.id, this.cliente).subscribe(() => {
          this.loadClientes();
          this.clienteDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente actualizado correctamente',
          });
        });
      } else {
        // Crear
        this.clienteService.createCliente(this.cliente).subscribe(() => {
          this.loadClientes();
          this.clienteDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente creado correctamente',
          });
        });
      }
    }
  }

  deleteCliente(cliente: Cliente) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar al cliente "${cliente.nombre}"?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (cliente.id) {
          this.clienteService.deleteCliente(cliente.id).subscribe(() => {
            this.clientes = this.clientes.filter((c) => c.id !== cliente.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cliente eliminado correctamente',
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

  hideDialog() {
    this.clienteDialog = false;
    this.submitted = false;
  }

  // Manejo de Contactos
  openNewContacto() {
    this.contacto = {} as Contacto;
    this.isEditContacto = false;
    this.contactoDialog = true;
  }

  editContacto(cont: Contacto) {
    this.contacto = { ...cont };
    this.isEditContacto = true;
    this.contactoDialog = true;
  }

  saveContacto() {
    if (!this.contacto.nombre?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'El contacto debe tener al menos un nombre',
      });
      return;
    }

    if (!this.cliente.contactos) {
      this.cliente.contactos = [];
    }

    if (this.isEditContacto && this.contacto.id) {
      // Buscar el contacto en el array y actualizar
      const index = this.cliente.contactos.findIndex(c => c.id === this.contacto.id);
      if (index >= 0) {
        this.cliente.contactos[index] = { ...this.contacto };
      } else {
        // Si no encuentra, lo agrega (podrías manejar IDs temporales)
        this.cliente.contactos.push({ ...this.contacto });
      }
    } else {
      // Crear nuevo (en el array local)
      // Podrías asignar un ID temporal si necesitas
      this.cliente.contactos.push({ ...this.contacto });
    }
    this.contactoDialog = false;
  }

  deleteContacto(cont: Contacto) {
    // Eliminar del array local
    this.cliente.contactos = this.cliente.contactos?.filter(c => c !== cont);
  }

  hideContactoDialog() {
    this.contactoDialog = false;
  }
}