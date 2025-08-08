import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';
import { Cliente, ClienteService } from '../../../service/cliente.service';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ProductoFabricadoService } from '../../../service/producto-fabricado.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButton } from 'primeng/radiobutton';
import { RecetaService } from '../../../service/receta.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OrdenFabricacionService } from '../../../service/orden-fabricacion.service';
import { YacimientoService } from '../../../service/yacimiento.service';
import { Yacimiento } from '../../../yacimiento/yacimiento.interface';
import { ArticuloServiceService } from '../../../service/articulo-service.service';
import { InputNumberModule } from 'primeng/inputnumber';



@Component({
  selector: 'app-orden-fabricacion-modal',
  imports: [
    DialogModule,
    StepsModule,
    StepperModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    CommonModule,
    FileUploadModule,
    DropdownModule,
    ReactiveFormsModule,
    DatePickerModule,
    TextareaModule,
    IftaLabelModule,
    SelectModule,
    MultiSelectModule,
    RadioButton,
    InputNumberModule
  ],
  standalone: true,
  templateUrl: './orden-fabricacion-modal.component.html',
  styleUrl: './orden-fabricacion-modal.component.scss'
})
export class OrdenFabricacionModalComponent implements OnInit {

  @Output() closeModal = new EventEmitter<void>();
  display: boolean = true;
  activeIndex: number = 0;
  steps: any[] = [];
  formOrden: FormGroup;

  // Opciones para los dropdowns (deben llenarse a partir de tus servicios)
  clientesOptions: any[] = [];
  prioridadOptions: any[] = [
    { label: 'BAJA', value: 'BAJA' },
    { label: 'MEDIA', value: 'MEDIA' },
    { label: 'ALTA', value: 'ALTA' }
  ];
  contactosOptions: any[] = []; // Datos de contactos (deben llenarse a partir de tus servicios)
  skidOptions: any[] = [
    { name: 'SOLAR', code: 'SOLAR' },
    { name: 'NEUMATICO', code: 'NEUMATICO' },
    { name: 'ELECTRICO', code: 'ELECTRICO' },
    { name: 'RESERVA', code: 'RESERVA' }
  ]; // Ej: [{ label: 'Skid Solar - 100lts', value: 'skid1' }, ... ]
  tableroOptions: any[] = []; // Datos de tableros
  instrumentoOptions: any[] = []; // Datos de instrumentos
  clientes: Cliente[] = [];
  skids: any[] = [];

  baterias: any[] = [
    { name: '1', code: '1' },
    { name: '2', code: '2' },
    { name: '3', code: '3' },
    { name: '4', code: '4' },
    { name: 'No aplica', code: 'No aplica' }
  ]

  tanque: any[] = [
    { name: 'SI', key: true },
    { name: 'NO', key: false },
  ]

  calibracion: any[] = [
    { name: 'SI', key: true },
    { name: 'NO', key: false },
  ]
  today: Date = new Date();
  yacimientoOptions: { label: string; value: number }[] = [];  // <- nuevas opciones

  panelOptions: Array<{ name: string; id: number }> = [];
  bombaOptions: Array<{ name: string; id: number }> = [];
  showPaneles = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private skidService: ProductoFabricadoService,
    private componentService: RecetaService,
    private ordenService: OrdenFabricacionService,
    private yacService: YacimientoService,
    private insumoService: ArticuloServiceService) {

    this.steps = [
      { label: 'Información General' },
      { label: 'Configuración Skid' },
      { label: 'Resumen' }
    ];


    this.formOrden = this.fb.group({
      // Datos generales
      codigo: ["", Validators.required],
      cliente: [null, Validators.required],
      prioridad: ["", Validators.required],
      fechaEntrega: ["", Validators.required],
      contacto: [{ value: null, disabled: true }, Validators.required],
      nroOC: ["", Validators.required],
      yacimiento: [{ value: null, disabled: true }, Validators.required],
      observaciones: [""],
      pto: [""],
      // Los datos de fileUpload se gestionan en onFileSelect
      // Datos del skid (Paso 2)
      cantidadSkid: [1, Validators.required],
      tipoSkid: [null, Validators.required],
      skid: [{ value: null, disabled: true }, Validators.required],
      paneles: this.fb.array([
        this.fb.group({
          modelo: [null, Validators.required],   // code o id del panel
          cantidad: [1, [Validators.required, Validators.min(1)]],
        })
      ]), baterias: [{ value: 'No aplica', disabled: true }],
      bombasDet: this.fb.array([
        this.fb.group({
          modelo: [null, Validators.required],   // code o id de la bomba
          cantidad: [1, [Validators.required, Validators.min(1)]],
        })
      ]),
      psv: [""],
      tanque: [false, Validators.required],
      calibracion: [false, Validators.required],
      tableros: [""],
      instrumentos: [""]
    });

    // Cargar las opciones de clientes, skid, bombas, tableros, etc., desde tus servicios
    // Ejemplo:
    // this.clienteService.getClientesOptions().subscribe(options => this.clientesOptions = options);
  }

  ngOnInit() {

    this.loadData();
    this.cargarCompnentes();

    this.insumoService.getInsumos({ tipoInsumo: 'panel' })
      .subscribe(list => this.panelOptions = list); // list ya trae {name, id}


    this.formOrden.get('cliente')!.valueChanges.subscribe(clienteId => {
      if (clienteId) {
        // 1) habilita contacto (como ya tenías)
        const contactos = this.clientes.find(c => c.id === clienteId)?.contactos || [];
        this.contactosOptions = contactos.map(ct => ({ label: ct.nombre, value: ct.id }));
        this.formOrden.get('contacto')!.enable();

        // 2) pide al backend los yacimientos
        this.yacService.findByCliente(clienteId).subscribe((list: Yacimiento[]) => {
          this.yacimientoOptions = list.map(y => ({ label: y.nombre!, value: y.id! }));
          this.formOrden.get('yacimiento')!.enable();
        });
      } else {
        // si quita la selección, limpiamos y deshabilitamos
        this.formOrden.get('contacto')!.reset();
        this.formOrden.get('contacto')!.disable();
        this.formOrden.get('yacimiento')!.reset();
        this.formOrden.get('yacimiento')!.disable();
        this.yacimientoOptions = [];
      }
    });

    this.formOrden.get('tipoSkid')?.valueChanges.subscribe((tipoSkid) => {
      if (tipoSkid) {
        this.insumoService.getInsumos({ tipoInsumo: 'bomba', categoria: tipoSkid })
          .subscribe(list => this.bombaOptions = list); // {name, id}
      } else {
        this.bombaOptions = [];
      }
    });

    // UNIFICADO: controlar paneles + cargar bombas + cargar skids + habilitar campos
    this.formOrden.get('tipoSkid')?.valueChanges.subscribe((tipoSkid) => {
      // Mostrar paneles solo si es SOLAR
      this.showPaneles = tipoSkid === 'SOLAR';
      if (!this.showPaneles) {
        while (this.panelesFA.length > 1) this.panelesFA.removeAt(this.panelesFA.length - 1);
        this.panelesFA.at(0).patchValue({ modelo: null, cantidad: 1 });
      }

      // Bombas por categoría
      if (tipoSkid) {
        this.insumoService.getInsumos({ tipoInsumo: 'bomba', categoria: tipoSkid })
          .subscribe(list => this.bombaOptions = list);
      } else {
        this.bombaOptions = [];
      }

      // Skids por tipo
      if (tipoSkid) {
        this.skidService.getSkidByTipo(tipoSkid).subscribe((data) => {
          this.skids = data.map((skid) => ({ label: `${skid.nombre}, lts: ${skid.lts}`, value: skid.id }));
          this.formOrden.get('skid')?.enable();

          if (tipoSkid === 'SOLAR') {
            this.formOrden.get('baterias')?.enable();
          } else {
            this.formOrden.get('baterias')?.setValue('No aplica');
            this.formOrden.get('baterias')?.disable();
          }
        });
      } else {
        this.skids = [];
        this.formOrden.get('skid')?.setValue(null);
        this.formOrden.get('skid')?.disable();
        this.formOrden.get('baterias')?.setValue('No aplica');
      }
    });
    // Cargar otras opciones necesarias (skid, bombas, tableros, etc.)
    // this.loadOtherOptions();
  }

  cargarCompnentes() {
    this.componentService.getRecetaByTipo("Tablero").subscribe((data) => {
      this.tableroOptions = data.map((tablero) => ({ name: `${tablero.nombre}`, code: tablero.id }));
      console.log(this.tableroOptions);
    })

    this.componentService.getRecetaByTipo("Instrumento").subscribe((data) => {
      this.instrumentoOptions = data.map((instrumento) => ({ name: `${instrumento.nombre}`, code: instrumento.id }));
    })

  }

  loadData() {
    this.clienteService.getClientes().subscribe((data) => {
      this.clientes = data;
      this.clientesOptions = data.map(cliente => ({ label: cliente.nombre, value: cliente.id }));
    })
  }

  get panelesFA() { return this.formOrden.get('paneles') as import('@angular/forms').FormArray; }
  get bombasFA() { return this.formOrden.get('bombasDet') as import('@angular/forms').FormArray; }


  nextStep() {
    // Validar el paso actual antes de avanzar
    if (this.activeIndex === 0) {
      this.validateStep1();
    } else if (this.activeIndex === 1) {
      this.validateStep2();
    }

    if (this.activeIndex < this.steps.length - 1 && this.isStepValid(this.activeIndex)) {
      this.activeIndex++;
    }
  }

  // Verifica si el paso actual es válido
  isStepValid(stepIndex: number): boolean {
    if (stepIndex === 1) {
      const arraysOk = this.panelesFA.valid && this.bombasFA.valid;
      return this.formOrden.get('cantidadSkid')!.valid &&
        this.formOrden.get('tipoSkid')!.valid &&
        this.formOrden.get('skid')!.valid &&
        arraysOk &&
        this.formOrden.get('tanque')!.valid &&
        this.formOrden.get('calibracion')!.valid;
    }
    // resto igual
    return stepIndex === 0
      ? /* tu validación del paso 1 */
      this.formOrden.get('codigo')!.valid &&
      this.formOrden.get('cliente')!.valid &&
      this.formOrden.get('prioridad')!.valid &&
      this.formOrden.get('fechaEntrega')!.valid &&
      this.formOrden.get('contacto')!.valid &&
      this.formOrden.get('yacimiento')!.valid
      : true;
  }

  // Validación específica para el paso 1
  validateStep1() {
    const step1Controls = [
      'codigo', 'cliente', 'prioridad',
      'fechaEntrega', 'contacto', 'yacimiento'
    ];

    step1Controls.forEach(controlName => {
      this.formOrden.get(controlName)?.markAsTouched();
    });
  }

  // Validación específica para el paso 2
  validateStep2() {
    ['cantidadSkid', 'tipoSkid', 'skid', 'tanque', 'calibracion']
      .forEach(n => this.formOrden.get(n)?.markAsTouched());
    this.panelesFA.controls.forEach(c => c.markAllAsTouched());
    this.bombasFA.controls.forEach(c => c.markAllAsTouched());
  }

  prevStep() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  confirm(): void {
    const v = this.formOrden.value;

    // Normalizo arrays (si no hay, mando [])
    const paneles = (v.paneles ?? []).map((it: any) => ({
      insumoId: Number(it.modelo),     // <-- ID del panel
      cantidad: Number(it.cantidad),   // <-- Cantidad
      tipo: 'panel'                    // opcional si te sirve en backend
    }));

    const bombas = (v.bombasDet ?? []).map((it: any) => ({
      insumoId: Number(it.modelo),     // <-- ID de la bomba
      cantidad: Number(it.cantidad),   // <-- Cantidad
      tipo: 'bomba'                    // opcional
    }));

    const snapshotSkid = {
      paneles,             // ej: [{insumoId:53048, cantidad:2}, ...]
      bombas,              // ej: [{insumoId:123, cantidad:1}, ...]
      tanque: v.tanque,
      calibracion: v.calibracion,
      psv: v.psv,
      tableros: v.tableros,            // si son IDs, OK; si no, mapear igual que arriba
      instrumentos: v.instrumentos,
      productoFabricadoId: v.skid
    };

    const orderDataFinal = {
      cantidad: v.cantidadSkid,
      productoFabricadoId: v.skid,
      codigo: v.codigo,
      yacimiento: v.yacimiento,
      observaciones: v.observaciones,
      nroPresupuesto: v.pto,
      prioridad: v.prioridad,
      fechaEntrega: v.fechaEntrega,
      pedidoCliente: {
        numero: v.nroOC,
        adjunto: v.fileOC ?? null,
        clienteId: v.cliente,
        contactoId: v.contacto,
      },
      snapshotSkid
    };

    this.ordenService.createOrdenFabricacion(orderDataFinal).subscribe((data) => {
      this.closeModal.emit(data);
      this.close();
    });
  }

  cancel() {
    this.close();
  }

  close() {
    this.display = false;
    this.closeModal.emit();
  }

  onFileSelect(event: any) {
    // Al seleccionar archivo, asigna a la propiedad (por ejemplo, nroOCFile)
    const file = event.files[0];
    this.formOrden.patchValue({ fileOC: file });
  }

  getClienteNombre(clienteId: any): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : '';
  }

  getContactoNombre(contactoId: any): string {
    // Similar, buscando en la lista de contactos de algún modo
    const contacto = this.contactosOptions.find(c => c.value === contactoId);
    return contacto ? contacto.label : '';
  }

  // Helper para Tableros (asumiendo que tableroOptions contiene { name, code })
  getTablerosNames(): string {
    if (this.formOrden.value.tableros && Array.isArray(this.formOrden.value.tableros)) {
      return this.formOrden.value.tableros.map((code: string) => {
        const found = this.tableroOptions.find(t => t.code === code);
        return found ? found.name : code;
      }).join(', ');
    }
    return '–';
  }

  // Helper para Instrumentos
  getInstrumentosNames(): string {
    if (this.formOrden.value.instrumentos && Array.isArray(this.formOrden.value.instrumentos)) {
      return this.formOrden.value.instrumentos.map((code: string) => {
        const found = this.instrumentoOptions.find(i => i.code === code);
        return found ? found.name : code;
      }).join(', ');
    }
    return '–';
  }

  getSkidName(): string {
    const selectedSkid = this.skids.find((item) => item.value === this.formOrden.value.skid);
    return selectedSkid ? selectedSkid.label : this.formOrden.value.skid;
  }

  // Dentro de tu componente:
  exportToPDF(): void {
    const data = document.getElementById('pdfContent');
    if (data) {
      html2canvas(data, { scale: 2 }).then(canvas => {
        const imgWidth = 210; // Ancho A4 en mm
        const pageHeight = 295; // Altura A4 en mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        const contentDataURL = canvas.toDataURL('image/png');
        let pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;

        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`orden_fabricacion_${new Date().getTime()}.pdf`);
      });
    }
  }


  addPanel() {
    this.panelesFA.push(this.fb.group({
      modelo: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    }));
  }

  removePanel(i: number) { this.panelesFA.removeAt(i); }

  addBomba() {
    const totalPermitido = 4 * (this.formOrden.get('cantidadSkid')?.value || 1);
    const totalActual = this.bombasFA.value.reduce((acc: number, it: any) => acc + (Number(it.cantidad) || 0), 0);
    if (totalActual >= totalPermitido) return; // corta en seco
    this.bombasFA.push(this.fb.group({
      modelo: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    }));
  }

  removeBomba(i: number) { this.bombasFA.removeAt(i); }


  private getNombreById(list: { name: string; id: number }[], id: any): string {
    return list.find(x => String(x.id) === String(id))?.name ?? String(id ?? '–');
  }

  getBombasNames(): string {
    if (!this.bombasFA?.value?.length) return '–';
    return this.bombasFA.value
      .map((it: any) => `${this.getNombreById(this.bombaOptions, it.modelo)} x${Number(it.cantidad) || 0}`)
      .join(', ');
  }

  getPanelesNames(): string {
    if (!this.panelesFA?.value?.length) return '–';
    return this.panelesFA.value
      .map((it: any) => `${this.getNombreById(this.panelOptions, it.modelo)} x${Number(it.cantidad) || 0}`)
      .join(', ');
  }
}