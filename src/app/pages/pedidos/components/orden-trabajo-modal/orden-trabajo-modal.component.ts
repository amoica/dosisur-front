import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';
import { Cliente, ClienteService } from '../../../service/cliente.service';


@Component({
  selector: 'app-orden-trabajo-modal',
  imports: [
    DialogModule,
    StepperModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    CommonModule,
    StepsModule

  ],
  standalone: true,
  templateUrl: './orden-trabajo-modal.component.html',
  styleUrl: './orden-trabajo-modal.component.scss'
})
export class OrdenTrabajoModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  display: boolean = true;
  activeIndex: number = 0;
  steps: any[] = [];
  clientes: Cliente[] = [];
  ordenData: any = {}; // Datos ingresados en cada paso


  constructor( private clienteService: ClienteService ) {
    this.steps = [
      { label: 'Información del Pedido' },
      { label: 'Detalle de Compra' },
      { label: 'Resumen' }
    ];
  }

  ngOnInit(): void {
    this.clienteService.getClientes().subscribe((clientes: Cliente[]) => {
      this.clientes = clientes;
    }
    );
  }

  nextStep() {
    if (this.activeIndex < this.steps.length - 1) {
      this.activeIndex++;
    }
  }

  prevStep() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  confirm() {
    // Lógica para confirmar la orden de compra
    console.log("Orden de Compra confirmada", this.ordenData);
    this.close();
  }

  cancel() {
    this.close();
  }

  close() {
    this.display = false;
    this.closeModal.emit();
  }
}
