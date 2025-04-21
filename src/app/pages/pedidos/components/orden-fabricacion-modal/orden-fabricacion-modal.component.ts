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
    RadioButton
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
  bombaOptions: any[] = []; // Datos de bombas
  tableroOptions: any[] = []; // Datos de tableros
  instrumentoOptions: any[] = []; // Datos de instrumentos
  clientes: Cliente[] = [];
  skids: any[] = [];
  potenciaPaneles: any[] = [
    { name: '1 de 380W', code: '1 de 380W' },
    { name: '2 de 380W', code: '2 de 380W' },
    { name: '1 de 450W', code: '1 de 450W' },
    { name: '2 de 450W', code: '2 de 450W' },
    { name: '1 de 160W', code: '1 de 160W' },
    { name: 'No aplica', code: 'No aplica' }
  ];

  baterias: any[] = [
    { name: '1', code: '1' },
    { name: '2', code: '2' },
    { name: '3', code: '3' },
    { name: '4', code: '4' },
    { name: 'No aplica', code: 'No aplica' }
  ]

  bombas: any[] = [
    { name: 'SIN BOMBA', code: 'SIN BOMBA' },
    { name: 'Baja Presión (menos a 200 kgF)', code: 'Baja Presión' },
    { name: 'Alta Presión (mayor a 200)', code: 'Alta Presión' },
    { name: 'Motor APE', code: 'Motor APE' },
  ];

  tanque: any[] = [
    { name: 'SI', key: true },
    { name: 'NO', key: false },
  ]

  calibracion: any[] = [
    { name: 'SI', key: true },
    { name: 'NO', key: false },
  ]
  today: Date = new Date();

  constructor(private fb: FormBuilder, private clienteService: ClienteService, private skidService: ProductoFabricadoService, private componentService: RecetaService, private ordenService: OrdenFabricacionService) {
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
      nroOC: [""],
      yacimiento: ["", Validators.required],
      observaciones: [""],
      pto: [""],
      // Los datos de fileUpload se gestionan en onFileSelect
      // Datos del skid (Paso 2)
      cantidadSkid: [1, Validators.required],
      tipoSkid: [null, Validators.required],
      skid: [{ value: null, disabled: true }, Validators.required],
      potenciaPaneles: [{ value: 'No aplica', disabled: true }],
      baterias: [{ value: 'No aplica', disabled: true }],
      bombas: ["", Validators.required],
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

    this.formOrden.get('cliente')?.valueChanges.subscribe((cliente) => {
      if (cliente) {
        let contactos = this.clientes.find(c => c.id === cliente)?.contactos;
        this.contactosOptions = contactos!.map(contacto => ({ label: contacto.nombre, value: contacto.id }));
        this.formOrden.get('contacto')?.enable();
      }
      else {
        this.contactosOptions = [];
        this.formOrden.get('contacto')?.setValue(null);
        this.formOrden.get('contacto')?.disable();
      }
    })

    this.formOrden.get('tipoSkid')?.valueChanges.subscribe((tipoSkid) => {
      if (tipoSkid) {
        this.skidService.getSkidByTipo(tipoSkid).subscribe((data) => {
          this.skids = data.map((skid) => ({ label: `${skid.nombre}, lts: ${skid.lts}`, value: skid.id }));
          this.formOrden.get('skid')?.enable();

          if (tipoSkid === 'SOLAR') {
            this.formOrden.get('potenciaPaneles')?.enable();
            this.formOrden.get('baterias')?.enable();
          } else {
            this.formOrden.get('potenciaPaneles')?.setValue('No aplica');
            this.formOrden.get('potenciaPaneles')?.disable();
            this.formOrden.get('baterias')?.setValue('No aplica');
            this.formOrden.get('baterias')?.disable();
          }

        });
      } else {
        this.skids = [];
        this.formOrden.get('skid')?.setValue(null);
        this.formOrden.get('skid')?.disable();
        this.formOrden.get('potenciaPaneles')?.setValue('No aplica');
        this.formOrden.get('baterias')?.setValue('No aplica');
      }

    })
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

  confirm(): void {
    // Se construye un objeto final con solo los campos necesarios
    const formValue = this.formOrden.value;

    // Armar el objeto snapshotSkid con los datos de la configuración del skid
    const snapshotSkid = {
      // en el resumen se muestra el nombre a través de un helper, pero aquí se envía el valor
      potenciaPaneles: formValue.potenciaPaneles,
      baterias: formValue.baterias,
      bombas: formValue.bombas,
      tanque: formValue.tanque,
      calibracion: formValue.calibracion,
      psv: formValue.psv,
      tableros: formValue.tableros,
      instrumentos: formValue.instrumentos,
      productoFabricadoId: formValue.skid,

    };

    // Construir el objeto final de la orden, extrayendo solo los campos esenciales
    const orderDataFinal = {
      cantidad: formValue.cantidadSkid,
      productoFabricadoId: formValue.skid,
      codigo: formValue.codigo,
      yacimiento: formValue.yacimiento,
      observaciones: formValue.observaciones,
      nroPresupuesto: formValue.pto,
      prioridad: formValue.prioridad,
      fechaEntrega: formValue.fechaEntrega,
      pedidoCliente: {
        numero: formValue.nroOC,
        adjunto: formValue.fileOC ? formValue.fileOC : null,
        clienteId: formValue.cliente,
        contactoId: formValue.contacto,
      },
      // Si tienes fileOC, asegúrate de haberlo subido previamente y almacenar su URL o path
      snapshotSkid
    };

    console.log("Orden de Fabricación final a enviar:", orderDataFinal);

    this.ordenService.createOrdenFabricacion(orderDataFinal).subscribe((data) => {
      this.closeModal.emit(data);
      this.close();
    })

    // Llama a tu servicio backend para crear la orden de fabricación
    // this.backendService.createOrdenFabricacion(orderDataFinal).subscribe(res => { ... });


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

  // Helper para Bombas (en caso de multiselect, se espera un array)
  getBombasNames(): string {
    if (this.formOrden.value.bombas) {
      // Si es array:
      if (Array.isArray(this.formOrden.value.bombas)) {
        return this.formOrden.value.bombas.map((code: string) => {
          const found = this.bombas.find(b => b.code === code);
          return found ? found.name : code;
        }).join(', ');
      } else {
        // Si viene como string:
        const found = this.bombas.find(b => b.code === this.formOrden.value.bombas);
        return found ? found.name : this.formOrden.value.bombas;
      }
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
}