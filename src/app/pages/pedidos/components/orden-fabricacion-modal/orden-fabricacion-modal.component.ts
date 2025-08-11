import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-orden-fabricacion-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  templateUrl: './orden-fabricacion-modal.component.html',
  styleUrl: './orden-fabricacion-modal.component.scss'
})
export class OrdenFabricacionModalComponent implements OnInit {

  @Output() closeModal = new EventEmitter<void>();

  display = true;
  activeIndex = 0;
  steps: any[] = [];
  formOrden: FormGroup;
  loading = false;

  // Catálogos
  clientes: Cliente[] = [];
  clientesOptions: Array<{ label: string; value: number | null }> = [];
  contactosOptions: Array<{ label: string; value: number | null }> = [];
  yacimientoOptions: Array<{ label: string; value: number | null }> = [];

  prioridadOptions = [
    { label: 'BAJA', value: 'BAJA' },
    { label: 'MEDIA', value: 'MEDIA' },
    { label: 'ALTA', value: 'ALTA' }
  ];

  skidOptions = [
    { name: 'SOLAR', code: 'SOLAR' },
    { name: 'NEUMATICO', code: 'NEUMATICO' },
    { name: 'ELECTRICO', code: 'ELECTRICO' },
    { name: 'RESERVA', code: 'RESERVA' }
  ];

  skids: Array<{ label: string; value: number }> = [];

  baterias = [
    { name: '1', code: '1' },
    { name: '2', code: '2' },
    { name: '3', code: '3' },
    { name: '4', code: '4' },
    { name: 'No aplica', code: 'No aplica' }
  ];

  tanque = [
    { name: 'SI', key: true },
    { name: 'NO', key: false },
  ];

  calibracion = [
    { name: 'SI', key: true },
    { name: 'NO', key: false },
  ];

  panelOptions: Array<{ name: string; id: number }> = [];
  bombaOptions: Array<{ name: string; id: number }> = [];

  tableroOptions: Array<{ id: number; name: string; codeText?: string }> = [];
  instrumentoOptions: Array<{ id: number; name: string; codeText?: string }> = [];

  showPaneles = false;
  today: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private skidService: ProductoFabricadoService,
    private recetaService: RecetaService,
    private ordenService: OrdenFabricacionService,
    private yacService: YacimientoService,
    private insumoService: ArticuloServiceService
  ) {

    this.steps = [
      { label: 'Información General' },
      { label: 'Configuración Skid' },
      { label: 'Resumen' }
    ];

    this.formOrden = this.fb.group({
      // Paso 1
      codigo: ['', Validators.required],
      cliente: [null, Validators.required],
      prioridad: ['', Validators.required],
      fechaEntrega: ['', Validators.required],
      contacto: [{ value: null, disabled: true }, Validators.required],
      nroOC: ['', Validators.required],
      yacimiento: [{ value: null, disabled: true }, Validators.required],
      observaciones: [''],
      pto: [''],

      // Paso 2
      cantidadSkid: [1, [Validators.required, Validators.min(1)]],
      tipoSkid: [null, Validators.required],
      skid: [{ value: null, disabled: true }, Validators.required],

      paneles: this.fb.array([
        this.fb.group({
          modelo: [null, Validators.required], // id del panel
          cantidad: [1, [Validators.required, Validators.min(1)]],
        })
      ]),
      baterias: [{ value: 'No aplica', disabled: true }],

      bombasDet: this.fb.array([
        this.fb.group({
          modelo: [null, Validators.required], // id de la bomba
          cantidad: [1, [Validators.required, Validators.min(1)]],
        })
      ]),

      psv: [''],
      tanque: [false, Validators.required],
      calibracion: [false, Validators.required],

      tableros: [[]],      // number[]
      instrumentos: [[]],  // number[]
    });
  }

  // ---- getters de FormArray
  get panelesFA(): FormArray { return this.formOrden.get('paneles') as FormArray; }
  get bombasFA(): FormArray { return this.formOrden.get('bombasDet') as FormArray; }

  ngOnInit(): void {
    this.loadClientes();
    this.loadRecetas();
    this.loadPaneles();

    // Bombas por tipo de skid
    this.formOrden.get('tipoSkid')?.valueChanges.subscribe((tipoSkid) => {
      // Mostrar/ocultar paneles
      this.showPaneles = tipoSkid === 'SOLAR';
      if (!this.showPaneles) {
        // Limpieza agresiva
        while (this.panelesFA.length > 1) this.panelesFA.removeAt(this.panelesFA.length - 1);
        this.panelesFA.at(0).patchValue({ modelo: null, cantidad: 1 });
        this.formOrden.get('baterias')?.setValue('No aplica');
        this.formOrden.get('baterias')?.disable();
      } else {
        this.formOrden.get('baterias')?.enable();
      }

      // Bombas
      if (tipoSkid) {
        this.insumoService.getInsumos({ tipoInsumo: 'bomba', categoria: tipoSkid })
          .subscribe((list: Array<{ name: string; id: number }>) => this.bombaOptions = list);
      } else {
        this.bombaOptions = [];
      }

      // Skids por tipo
      if (tipoSkid) {
        this.skidService.getSkidByTipo(tipoSkid).subscribe((data: any) => {
          this.skids = data.map((skid: any) => ({ label: `${skid.nombre}, lts: ${skid.lts}`, value: skid.id }));
          this.formOrden.get('skid')?.enable();
        });
      } else {
        this.skids = [];
        this.formOrden.get('skid')?.setValue(null);
        this.formOrden.get('skid')?.disable();
      }
    });

    // Contactos + Yacimientos por cliente
    this.formOrden.get('cliente')!.valueChanges.subscribe(clienteId => {
      if (clienteId) {
        const contactos = this.clientes.find(c => c.id === clienteId)?.contactos || [];
        this.contactosOptions = contactos.map(ct => ({ label: ct.nombre, value: ct.id ?? null }));
        this.formOrden.get('contacto')!.enable();

        this.yacService.findByCliente(clienteId).subscribe((list: Yacimiento[]) => {
          this.yacimientoOptions = list.map(y => ({ label: y.nombre!, value: y.id! }));
          this.formOrden.get('yacimiento')!.enable();
        });
      } else {
        this.formOrden.get('contacto')!.reset();
        this.formOrden.get('contacto')!.disable();
        this.formOrden.get('yacimiento')!.reset();
        this.formOrden.get('yacimiento')!.disable();
        this.yacimientoOptions = [];
      }
    });
  }

  // ---- Cargas iniciales
  private loadClientes() {
    this.clienteService.getClientes().subscribe((data) => {
      this.clientes = data;
      this.clientesOptions = data.map(c => ({ label: c.nombre, value: c.id ?? null }));
    });
  }

  private loadRecetas() {
    this.recetaService.getRecetaByTipo('Tablero').subscribe((data) => {
      this.tableroOptions = data.map(t => ({ id: t.id!, name: t.nombre, codeText: t.codigo }));
    });
    this.recetaService.getRecetaByTipo('Instrumento').subscribe((data) => {
      this.instrumentoOptions = data.map(i => ({ id: i.id!, name: i.nombre, codeText: i.codigo }));
    });
  }

  private loadPaneles() {
    this.insumoService.getInsumos({ tipoInsumo: 'panel' })
      .subscribe((list: Array<{ name: string; id: number }>) => this.panelOptions = list);
  }

  // ---- Navegación del wizard
  nextStep() {
    if (this.activeIndex === 0) this.validateStep1();
    else if (this.activeIndex === 1) this.validateStep2();

    if (this.activeIndex < this.steps.length - 1 && this.isStepValid(this.activeIndex)) {
      this.activeIndex++;
    }
  }

  prevStep() {
    if (this.activeIndex > 0) this.activeIndex--;
  }

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
    return stepIndex === 0
      ? this.formOrden.get('codigo')!.valid &&
      this.formOrden.get('cliente')!.valid &&
      this.formOrden.get('prioridad')!.valid &&
      this.formOrden.get('fechaEntrega')!.valid &&
      this.formOrden.get('contacto')!.valid &&
      this.formOrden.get('yacimiento')!.valid
      : true;
  }

  validateStep1() {
    ['codigo', 'cliente', 'prioridad', 'fechaEntrega', 'contacto', 'yacimiento']
      .forEach(n => this.formOrden.get(n)?.markAsTouched());
  }

  validateStep2() {
    ['cantidadSkid', 'tipoSkid', 'skid', 'tanque', 'calibracion']
      .forEach(n => this.formOrden.get(n)?.markAsTouched());
    this.panelesFA.controls.forEach(c => (c as FormGroup).markAllAsTouched());
    this.bombasFA.controls.forEach(c => (c as FormGroup).markAllAsTouched());
  }

  // ---- Acciones UI
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
    if (totalActual >= totalPermitido) return;
    this.bombasFA.push(this.fb.group({
      modelo: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    }));
  }
  removeBomba(i: number) { this.bombasFA.removeAt(i); }

  // ---- Confirmar (guardar)
  async confirm(): Promise<void> {
    // Validación del paso actual (defensivo)
    if (!this.isStepValid(this.activeIndex)) {
      this.validateStep1();
      this.validateStep2();
      return;
    }

    const v = this.formOrden.value;
    const esSolar = v.tipoSkid === 'SOLAR';

    const paneles = (v.paneles ?? [])
      .filter((it: any) => it?.modelo && it?.cantidad)
      .map((it: any) => ({ insumoId: Number(it.modelo), cantidad: Number(it.cantidad) }));

    const bombas = (v.bombasDet ?? [])
      .filter((it: any) => it?.modelo && it?.cantidad)
      .map((it: any) => ({ insumoId: Number(it.modelo), cantidad: Number(it.cantidad) }));

    const tableros: number[] = Array.isArray(v.tableros) ? v.tableros.map((id: any) => Number(id)) : [];
    const instrumentos: number[] = Array.isArray(v.instrumentos) ? v.instrumentos.map((id: any) => Number(id)) : [];

    const fechaEntregaISO =
      v.fechaEntrega instanceof Date ? v.fechaEntrega.toISOString() : v.fechaEntrega;

    const snapshotSkid = {
      paneles: esSolar ? paneles : [],
      bombas,
      tableros,
      instrumentos,
      tanque: !!v.tanque,
      calibracion: !!v.calibracion,
      psv: v.psv || '',
      baterias: esSolar ? v.baterias : 'No aplica',
    };

    // --- 1) si hay archivo, lo subimos al storage y tomamos la URL ---
    let adjuntoUrl: string | null = null;
    const file: File | undefined = v.fileOC;

    try {
      this.loading = true;

      if (file) {
        // Validaciones rápidas client-side
        const okTypes = ['application/pdf', 'image/png', 'image/jpeg'];
        if (!okTypes.includes(file.type)) {
          // reemplazá por tu toast si usás MessageService acá también
          alert('Tipo de archivo no permitido. Solo PDF/PNG/JPG.');
          this.loading = false;
          return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
          alert('El archivo excede los 10MB.');
          this.loading = false;
          return;
        }

        const resp = await lastValueFrom(this.ordenService.uploadOC(file)); // { url: string }
        adjuntoUrl = resp?.url ?? null;
      }

      // --- 2) armamos el payload final y creamos la OF ---
      const orderDataFinal = {
        cantidad: Number(v.cantidadSkid),
        productoFabricadoId: Number(v.skid),
        codigo: v.codigo,
        yacimiento: Number(v.yacimiento),
        observaciones: v.observaciones || '',
        nroPresupuesto: v.pto ? Number(v.pto) : undefined,
        prioridad: String(v.prioridad).toUpperCase(), // BAJA | MEDIA | ALTA
        fechaEntrega: fechaEntregaISO,
        pedidoCliente: {
          numero: v.nroOC,
          adjunto: adjuntoUrl, // ← si no hubo archivo queda null
          clienteId: Number(v.cliente),
          contactoId: Number(v.contacto),
        },
        snapshotSkid
      } as const;

      const data = await lastValueFrom(this.ordenService.createOrdenFabricacion(orderDataFinal));

      // éxito
      this.closeModal.emit(data);
      this.close();
    } catch (err: any) {
      // Manejo simple; si tenés MessageService, reemplazá el alert por toast
      const msg = err?.error?.message || err?.message || 'Error al crear la orden';
      alert(msg);
    } finally {
      this.loading = false;
    }
  }

  // ---- Utilidades UI
  cancel() { this.close(); }
  close() {
    this.display = false;
    this.closeModal.emit();
  }

  onFileSelect(e: any) {
    const file = e.files?.[0];
    this.formOrden.patchValue({ fileOC: file });
  }


  getClienteNombre(clienteId: any): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : '';
  }

  getContactoNombre(contactoId: any): string {
    const contacto = this.contactosOptions.find(c => c.value === contactIdAsNumber(contactoId));
    return contacto ? contacto.label : '';
  }

  getSkidName(): string {
    const selected = this.skids.find(s => s.value === Number(this.formOrden.value.skid));
    return selected ? selected.label : String(this.formOrden.value.skid ?? '—');
  }

  private getNombreById(list: { name: string; id: number }[], id: any): string {
    const found = list.find(x => String(x.id) === String(id));
    return found ? found.name : String(id ?? '–');
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

  getTablerosNames(): string {
    const ids: number[] = this.formOrden.value.tableros || [];
    if (!ids.length) return '–';
    return ids.map((id) => this.tableroOptions.find(t => t.id === id)?.name || id).join(', ');
  }

  getInstrumentosNames(): string {
    const ids: number[] = this.formOrden.value.instrumentos || [];
    if (!ids.length) return '–';
    return ids.map((id) => this.instrumentoOptions.find(i => i.id === id)?.name || id).join(', ');
  }

  exportToPDF(): void {
    const data = document.getElementById('pdfContent');
    if (!data) return;
    html2canvas(data, { scale: 2 }).then(canvas => {
      const imgWidth = 210, pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`orden_fabricacion_${Date.now()}.pdf`);
    });
  }
}

function contactIdAsNumber(val: any): number {
  return typeof val === 'string' ? Number(val) : val;
}
