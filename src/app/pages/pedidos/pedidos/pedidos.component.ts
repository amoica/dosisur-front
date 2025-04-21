import { Component, OnInit } from '@angular/core';
import { OrdenFabricacionModalComponent } from '../components/orden-fabricacion-modal/orden-fabricacion-modal.component';
import { OrdenTrabajoModalComponent } from '../components/orden-trabajo-modal/orden-trabajo-modal.component';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { OrdenFabricacionService } from '../../service/orden-fabricacion.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-pedidos',
  imports: [
    OrdenFabricacionModalComponent,
    OrdenTrabajoModalComponent,
    TableModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    CommonModule,
    DropdownModule,
    ToolbarModule,
    DatePickerModule,
    InputGroupModule,
    IconFieldModule,
    InputIconModule

  ],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.scss'
})
export class PedidosComponent implements OnInit {

  // Lista de pedidos con datos de ejemplo. En producción se obtendrían del backend.
  pedidos: any[] = [];

  // Variables para controlar la visualización de modales
  displayOrdenFabricacion: boolean = false;
  displayOrdenTrabajo: boolean = false;

  // Variables de filtros
  filtroTipo: any = null;
  filtroEstado: any = null;
  filtroFechaDesde: Date | null = null;
  filtroFechaHasta: Date | null = null;
  filtroCliente: string = '';

 

  constructor(private ordenService: OrdenFabricacionService, private router: Router) {

   

  }

  ngOnInit() {
    this.loadPedidoFabricacion();
  }

  loadPedidoFabricacion(){
    this.ordenService.getAllOrdenDeFabricacion().subscribe((data)=>{
      
      this.pedidos = data.data;
      console.log(this.pedidos);
    })
  }

  // Métodos para mostrar los modales
  showOrdenFabricacion() {
    this.displayOrdenFabricacion = true;
  }
  
  showOrdenTrabajo() {
    this.displayOrdenTrabajo = true;
  }

  onModalClose(createdOrder: any) {
    this.loadPedidoFabricacion();
    this.displayOrdenFabricacion = false;


    // Opción 2: Agregar la nueva orden a la lista, asumiendo que ya la tienes en createdOrder
    // this.pedidos.unshift(createdOrder);
  }

  // Métodos de acciones para la tabla
  editarPedido(pedido: any) {
    console.log("Editar pedido:", pedido);
  }
  darDeBajaPedido(pedido: any) {
    console.log("Dar de baja el pedido:", pedido);
  }
  verPedido(idPedido: number) {
    this.router.navigate(['gestion-general/pedidos/', idPedido]);
  }
}