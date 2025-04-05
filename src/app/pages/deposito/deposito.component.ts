import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DepositoService } from '../service/deposito.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-deposito',
  templateUrl: './deposito.component.html',
  imports: [
    TableModule,
    ButtonModule,
    ReactiveFormsModule,
    DialogModule,
    CommonModule,
    InputNumberModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    FormsModule
  ],
  styleUrls: ['./deposito.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class DepositoComponent implements OnInit {
  depositos: any[] = [];
  deposito: any = {};
  depositoDialog: boolean = false;
  depositoForm!: FormGroup;
  globalFilter: string = '';
  isSingleColumn: boolean = false; // Determina si el formulario tiene una o dos columnas
  isEdit: boolean = false; // Identifica si estamos editando o creando
  submitted: boolean = false; // Nueva propiedad para validar el envío del formulario

  constructor(
    private depositoService: DepositoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.fetchDepositos();
    this.depositoForm = this.fb.group({
      name: ['', Validators.required],
      ciudad: [''],
      direccion: [''],
    });

    this.updateFormColumns();
  }

  updateFormColumns() {
    this.isSingleColumn = Object.keys(this.depositoForm.controls).length <= 4;
  }

  fetchDepositos() {
    this.depositoService.getDepositos({}).subscribe({
      next: (data: any) => {
        this.depositos = data.data;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los depósitos.',
        });
      },
    });
  }

  showDepositoDialog() {
    this.deposito = {};
    this.submitted = false; // Reinicia el estado del formulario
    this.isEdit = false; // Nueva creación
    this.depositoForm.reset({ name: '', ciudad: '', direccion: '' });
    this.updateFormColumns();
    this.depositoDialog = true;
  }

  editDeposito(deposito: any) {
    this.deposito = { ...deposito };
    this.submitted = false; // Reinicia el estado del formulario
    this.isEdit = true; // Estamos editando
    this.depositoForm.patchValue(this.deposito);
    this.updateFormColumns();
    this.depositoDialog = true;
  }

  hideDepositoDialog() {
    this.depositoDialog = false;
  }

  saveDeposito() {
    this.submitted = true;

    if (this.depositoForm.invalid) {
      return;
    }

    if (this.isEdit && this.deposito.id) {
      // Editar depósito existente
      this.depositoService.updateDeposito(this.deposito.id, this.depositoForm.value).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Depósito actualizado correctamente.',
          });
          this.fetchDepositos();
          this.depositoDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el depósito.',
          });
        },
      });
    } else {
      // Crear nuevo depósito
      this.depositoService.createDeposito(this.depositoForm.value).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Depósito creado correctamente.',
          });
          this.fetchDepositos();
          this.depositoDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el depósito.',
          });
        },
      });
    }
  }

  deleteDeposito(id: number, name: string) {
    this.confirmationService.confirm({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar el depósito "${name}"?`,
      accept: () => {
        this.depositoService.deleteDeposito(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Depósito eliminado correctamente.',
            });
            this.fetchDepositos();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el depósito.',
            });
          },
        });
      },
    });
  }
}