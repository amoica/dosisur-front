import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { OrdenFabricacionService } from '../../service/orden-fabricacion.service';
import { ProductoFabricado, ProductoFabricadoService } from '../../service/producto-fabricado.service';
import { RecetaService } from '../../service/receta.service';
import { forkJoin } from 'rxjs';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormulasComponent } from '../components/formulas/formulas.component';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { ArticuloServiceService } from '../../service/articulo-service.service';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';


@Component({
  selector: 'app-pedido-fabricacion',
  templateUrl: './pedido-fabricacion.component.html',
  imports: [
    TableModule,
    CardModule,
    InputTextModule,
    CommonModule,
    ReactiveFormsModule,
    FormulasComponent,
    PanelModule,
    DividerModule,
    DropdownModule,
    ButtonModule,
    FieldsetModule,
    ConfirmDialogModule,
    ToastModule,
    FileUploadModule
  ],
  providers:[
    ConfirmationService, MessageService
  ],
  styleUrls: ['./pedido-fabricacion.component.scss']
})
export class PedidoFabricacionComponent implements OnInit {
  @ViewChildren(FormulasComponent) formulasComponents!: QueryList<FormulasComponent>;

  pedidoId: number = 0;
  pedido: any = {};
  snapshotForm!: FormGroup;
  skid!: ProductoFabricado;
  articulos: any[] = [];
  estadoDestino: 'APROBADA' | 'EN_PROCESO' | null = null;

  estadoOpciones = [
    { label: 'Aprobada', value: 'APROBADA' },
    { label: 'Procesada', value: 'EN_PROCESO' }
  ];

  constructor(
    private ordenService: OrdenFabricacionService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private skidService: ProductoFabricadoService,
    private articuloService: ArticuloServiceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.pedidoId = +this.route.snapshot.paramMap.get('id')!;
    this.ordenService.getOrdenById(this.pedidoId).subscribe(data => {
      this.pedido = data;
      console.log(data);
      this.loadSkid(this.pedido.productoFabricadoId);
      this.initSnapshotForm();
    });
    this.loadArticulos();
  }

  loadSkid(idSkid: number) {
    this.skidService.getSkid(idSkid).subscribe(data => {
      this.skid = data;
    });
  }

  loadArticulos() {
    this.articuloService.getArticulos().subscribe((res: any) => {
      this.articulos = res.data || res;
    });
  }

  initSnapshotForm(): void {
    const snapshot = this.pedido.snapshotSkid || {};
    this.snapshotForm = this.fb.group({
      potenciaPaneles: [snapshot.potenciaPaneles || '', Validators.required],
      baterias: [snapshot.baterias || '', Validators.required],
      bombas: this.fb.array((snapshot.bombas || []).map((b: string) => this.fb.control(b, Validators.required))),
      tanque: [snapshot.tanque || false, Validators.required],
      calibracion: [snapshot.calibracion || false, Validators.required],
      psv: [snapshot.psv || '', Validators.required],
      tableros: this.fb.array((snapshot.tableros || []).map((t: any) => this.fb.control(t))),
      instrumentos: this.fb.array((snapshot.instrumentos || []).map((i: any) => this.fb.control(i))),
      seccionesExtras: this.fb.array([]),
      estadoDestino: [null, Validators.required],
    });
  }

  get seccionesExtras(): FormArray {
    return this.snapshotForm.get('seccionesExtras') as FormArray;
  }

  createSeccion(tipo: 'receta' | 'personalizada'): FormGroup {
    return this.fb.group({
      tipo: [tipo, Validators.required],
      nombre: ['', Validators.required],
      baseComponenteId: [null],
      codigoComponente: [''],
      items: this.fb.array([])
    });
  }

  getItems(seccionIndex: number): FormArray {
    return this.seccionesExtras.at(seccionIndex).get('items') as FormArray;
  }

  addSeccion(tipo: 'receta' | 'personalizada'): void {
    this.seccionesExtras.push(this.createSeccion(tipo));
  }

  removeSeccion(index: number): void {
    this.seccionesExtras.removeAt(index);
  }

  addItem(seccionIndex: number): void {
    this.getItems(seccionIndex).push(this.fb.group({
      insumoId: [null, Validators.required],
      cantidad: [null, Validators.required]
    }));
  }

  removeItem(seccionIndex: number, itemIndex: number): void {
    this.getItems(seccionIndex).removeAt(itemIndex);
  }


  confirmarCambios() {
    if (!this.snapshotForm.valid) {
      this.snapshotForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Completá todos los campos requeridos antes de continuar.' });
      return;
    }
  
    const estadoDestino = this.snapshotForm.get('estadoDestino')?.value;
    if (!estadoDestino) {
      this.messageService.add({ severity: 'warn', summary: 'Estado requerido', detail: 'Seleccioná el estado al que querés avanzar.' });
      return;
    }
  
    const estadoMensaje = estadoDestino === 'APROBADA'
      ? 'Una vez aprobada, no se podrán hacer más modificaciones.'
      : 'Podrás seguir editando esta orden más adelante.';
  
    this.confirmationService.confirm({
      header: `¿Confirmar cambio a estado ${estadoDestino}?`,
      message: estadoMensaje,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, confirmar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const rawSnapshot = this.snapshotForm.getRawValue();
  
        const seccionesDesdeFormulas = this.formulasComponents.map(comp => ({
          tipo: 'receta',
          nombre: comp.nombreComponente,
          baseComponenteId: comp.idComponente,
          codigoComponente: '',
          items: comp.getSnapshot()
        }));
  
        const snapshot = {
          ...rawSnapshot,
          seccionesExtras: [...rawSnapshot.seccionesExtras, ...seccionesDesdeFormulas]
        };
  
        this.ordenService.updateOrden(this.pedidoId, {
          snapshotSkid: snapshot,
          estado: estadoDestino
        }).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Orden actualizada correctamente.' });
  
          // Refrescar los datos para actualizar la vista
          this.ordenService.getOrdenById(this.pedidoId).subscribe(data => {
            this.pedido = data;
            this.loadSkid(this.pedido.productoFabricadoId);
            this.initSnapshotForm();
          });
        });
      }
    });
  }

  getNombreArticulo(id: number): string {
    const art = this.articulos.find(a => a.id === id);
    return art ? art.name : '—';
  }

 /* confirmarCambios() {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas confirmar los cambios y pasar a estado PENDIENTE?',
      header: 'Confirmar Cambios',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.actualizarEstado('PENDIENTE');
      }
    });
  }
  */
  aprobarOrden() {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas aprobar la orden? Una vez aprobada, no se podrán realizar más cambios.',
      header: 'Aprobar Orden',
      icon: 'pi pi-check',
      accept: () => {
        this.actualizarEstado('APROBADA');
      }
    });
  }
  
  darCurso() {
    this.confirmationService.confirm({
      message: '¿Deseas dar curso a la orden y marcarla como EN_PROCESO?',
      header: 'Dar Curso',
      icon: 'pi pi-play',
      accept: () => {
        this.actualizarEstado('EN_PROCESO');
      }
    });
  }

  actualizarEstado(nuevoEstado: string) {
    // Lógica para actualizar el estado de la orden
    // Por ejemplo:
    this.ordenService.updateOrden(this.pedidoId, {
      estado: nuevoEstado
    }).subscribe(() => {
      this.pedido.estado = nuevoEstado;
      // Mostrar mensaje de éxito
    });
  }

  finalizarOrden(event: any) {
    // Aquí puedes manejar la carga del remito y luego cambiar el estado
    this.confirmationService.confirm({
      message: '¿Deseas finalizar la orden? Esta acción no se puede deshacer.',
      header: 'Finalizar Orden',
      icon: 'pi pi-check',
      accept: () => {
        this.actualizarEstado('FINALIZADA');
      }
    });
  }

}