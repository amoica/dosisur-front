import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PickListModule } from 'primeng/picklist';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { FluidModule } from 'primeng/fluid';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { Cliente, ClienteService } from '../../service/cliente.service';
import { ProductoFabricado, ProductoFabricadoService } from '../../service/producto-fabricado.service';
import { RecetaService } from '../../service/receta.service';

@Component({
  selector: 'app-movimiento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    PickListModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    FloatLabelModule,
    CardModule,
    FluidModule,
    SelectModule,
    RadioButtonModule,
    CheckboxModule
  ],
  templateUrl: './movimiento.component.html',
  styleUrls: ['./movimiento.component.scss'],
  providers: [MessageService],
})
export class MovimientoComponent implements OnInit {
  fabricacionForm!: FormGroup;

  // Ejemplos de catálogos (puedes reemplazar estos datos por los de tus servicios)
  clientes: Cliente[] = [];
  productosFabricados: ProductoFabricado[] = [];

  prioridades = [
    { label: 'Baja', value: 'BAJA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Alta', value: 'ALTA' }
  ];

  potenciaPaneles = [
    { label: '1 de 380W', value: '1 de 380W' },
    { label: '2 de 380W', value: '2 de 380W' },
    { label: '1 de 450W', value: '1 de 450W' },
    { label: '2 de 450W', value: '2 de 450W' },
    { label: '1 de 160W', value: '1 de 160W' },
    { label: 'No aplica', value: 'No aplica' }
  ];

  ltsOptions = [
    { label: '1200', value: 1200 },
    { label: '1000', value: 1000 },
    { label: '400', value: 400 },
    { label: '200', value: 200 },
    { label: 'No Aplica', value: 'No Aplica' }
  ];

  // Opciones para el filtro de tipo de skid
  skidTypes = [
    { label: 'ELECTRICO', value: 'ELECTRICO' },
    { label: 'SOLAR', value: 'SOLAR' },
    { label: 'NEUMÁTICO', value: 'NEUMÁTICO' },
    { label: 'RESERVA SÓLO', value: 'RESERVA SÓLO' }
  ];

  tanqueOptions = [
    { label: 'Sí', value: 'Si' },
    { label: 'No', value: 'No' }
  ];

  bombaOptions = [
    { label: 'SIN BOMBA', value: 'SIN BOMBA' },
    { label: 'BP (Baja Presión)', value: 'BP' },
    { label: 'AP (Alta Presión)', value: 'AP' },
    { label: 'Motor APE', value: 'Motor APE' }
  ];

  filteredSkids: ProductoFabricado[] = [];
  tableroOptions: any[] = [];      // Se cargarán con componentes de tipo "TABLERO"
  instrumentoOptions: any[] = [];

  constructor(private fb: FormBuilder,
              private clienteService: ClienteService,
              private skidService: ProductoFabricadoService,
              private recetaSercvice: RecetaService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCliente();
    this.loadSkid();
  }

  loadCliente(){ 
    this.clienteService.getClientes().subscribe(data => {
      this.clientes = data;
    }); 
  }

  loadSkid(){
    this.skidService.getSkids().subscribe(data => {
      this.productosFabricados = data;
      this.filteredSkids = data;
    });
  }

  loadComponentOptions():void{
    this.recetaSercvice.getRecetaByTipo('TABLERO').subscribe(data => {
      this.tableroOptions = data.map((item) => ({ name: item.nombre, key: item.codigo }));
    }
    );
    this.recetaSercvice.getRecetaByTipo('INSTRUMENTO').subscribe(data => {
      this.instrumentoOptions = data.map((item) => ({ name: item.nombre, key: item.codigo }));
    });

  }

  filterSkidsByType(tipo:string): void {
    if (tipo) {
      this.filteredSkids = this.productosFabricados.filter(skid => skid.tipo === tipo);
    } else {
      this.filteredSkids = this.productosFabricados;
    }
  }

  initForm(): void {
    this.fabricacionForm = this.fb.group({
      // Campos principales
      ordenFabricacion: ['', Validators.required],
      ocCliente: [''],
      cliente: [null, Validators.required],
      yacimiento: [''],
      fechaEntrega: [null, Validators.required],
      prioridad: [null],
      // Nuevo campo: tipo de skid para filtrar
      tipoSkid: [null, Validators.required],
      // Producto a fabricar (filtrado por tipoSkid)
      producto: [null, Validators.required],
      // Lts (se habilita una vez se selecciona el producto)
      lts: [null, Validators.required],
      cantidad: [1, Validators.min(1)],
      // Tanque y Bomba, ahora en formato select
      tanque: [null, Validators.required],
      bomba: [null, Validators.required],
      // Dropdowns para Tableros e Instrumentos (obtenidos de recetas/componentes)
      tableros: [null, Validators.required],
      instrumentos: [null, Validators.required],
      observacion: ['']
    });
  }

  /**
   * Validador personalizado para grupos de checkboxes + "otros"
   * Requiere que al menos un checkbox esté marcado o que el campo "otros" tenga contenido.
   */
  atLeastOneRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const groupValue = control.value;
    const hasAnyValue = Object.keys(groupValue).some(key => {
      if (typeof groupValue[key] === 'boolean') {
        return groupValue[key] === true;
      } else if (typeof groupValue[key] === 'string') {
        return groupValue[key].trim() !== '';
      }
      return false;
    });
    return hasAnyValue ? null : { requiredOne: true };
  }

  onProductoChange(event: any): void {
    const productoSeleccionado = event.value;
    console.log('Producto seleccionado:', productoSeleccionado);
  }

  finalizeOrdenFabricacion(): void {
    if (this.fabricacionForm.invalid) {
      this.fabricacionForm.markAllAsTouched();
      return;
    }
    console.log('Valores del formulario:', this.fabricacionForm.value);
    // Aquí se podría llamar a un servicio para enviar los datos.
  }
}
