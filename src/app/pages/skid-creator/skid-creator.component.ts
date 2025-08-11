import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RecetaService, Receta } from '../service/receta.service';
import { ProductoFabricadoService, ProductoFabricado } from '../service/producto-fabricado.service';
import { ArticuloServiceService } from '../service/articulo-service.service';
import { PanelMenuModule } from 'primeng/panelmenu';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { FileUpload } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { SkidDetailDialogComponent } from './skid-detail-dialog/skid-detail-dialog.component';
import { Articulo } from '../../core/model/articulo.model';


@Component({
  selector: 'app-skid-creator',
  standalone: true,
  imports: [
    SkidDetailDialogComponent,
    PanelMenuModule,
    TableModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    TabViewModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    DialogModule,
    PanelModule,
    FileUpload,
    CheckboxModule
  ],
  templateUrl: './skid-creator.component.html',
  styleUrls: ['./skid-creator.component.scss']
})
export class SkidCreatorComponent implements OnInit {
  skidForm!: FormGroup;
  recetas: Receta[] = [];
  articulos: Articulo[] = [];
  skids: ProductoFabricado[] = [];
  displayDetail: boolean = false;
  selectedSkid: ProductoFabricado | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File[] = [];
  imagePreviews: string[] = [];
  expandedRows: { [key: string]: boolean } = {};
  nextSectionId = 1;
  detailDialogVisible: boolean = false;
  enlargedImageUrl: string | null = null;
  imageDialogVisible: boolean = false;


  // Propiedades para el diálogo de confirmación
  confirmDialogVisible: boolean = false;
  // Objeto para almacenar códigos para secciones personalizadas (por índice)
  customSectionCodes: { [key: number]: string } = {};
  // Objeto para almacenar la elección de agregar a lista para secciones personalizadas
  customSectionAdd: { [key: number]: boolean } = {};
  tipoOptions: any[] = [];
  capacidadOptions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private productoFabricadoService: ProductoFabricadoService,
    private recetaService: RecetaService,
    private articuloService: ArticuloServiceService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.fetchRecetas();
    this.fetchArticulos();
    this.fetchSkids();

    this.tipoOptions = [
      { label: 'ELECTRICO', value: 'ELECTRICO' },
      { label: 'SOLAR', value: 'SOLAR' },
      { label: 'NEUMATICO', value: 'NEUMATICO' },
      { label: 'RESERVA', value: 'RESERVA' }
    ];
    
    this.capacidadOptions = [
      { label: '1200', value: 1200 },
      { label: '1000', value: 1000 },
      { label: '400', value: 400 },
      { label: '200', value: 200 },
      { label: 'No aplica', value: 0 }
    ];
  }

  /** Inicializa el formulario principal del Skid */
  initForm(): void {
    this.skidForm = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
      imagen: [''],
      tipo: ['', Validators.required],             // Nuevo campo para el select de tipo
      lts: [0, Validators.required], // Nuevo campo para la capacidad (valor por defecto "No aplica")
      secciones: this.fb.array([])
    });
  }

  onFilesSelected(event: any): void {
    if (event.files && event.files.length > 0) {
      this.selectedFile = Array.from(event.files);
      this.imagePreviews = [];
      for (const file of event.files) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  openDetailDialog(skid: ProductoFabricado): void {
    this.selectedSkid = skid;
    this.detailDialogVisible = true;
  }

  removeImage(index: number): void {
    this.selectedFile.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  /** Obtiene las recetas del backend */
  fetchRecetas(): void {
    this.recetaService.getRecetas().subscribe((res: any) => {
      this.recetas = res.data || res;
    });
  }

  /** Obtiene los artículos/insumos */
  fetchArticulos(): void {
    this.articuloService.getArticulos().subscribe((res: any) => {
      console.log(res);
      this.articulos = res.data || res;
    });
  }

  /** Obtiene los Skids creados */
  fetchSkids(): void {
    this.productoFabricadoService.getSkids().subscribe((res: any) => {
      this.skids = res;
      console.log(this.skids);
    });
  }

  /** Getter para el FormArray de secciones */
  get secciones(): FormArray {
    return this.skidForm.get('secciones') as FormArray;
  }

  /**
   * Crea un FormGroup para una sección.
   * – Para secciones de tipo "receta" se incluye el control 'baseComponenteId'.
   * – Para secciones "personalizadas" se incluye 'codigoComponente' para que el usuario pueda revisarlo.
   */
  createSeccion(tipo: string): FormGroup {
    const group: any = {
      id: [this.nextSectionId++],
      tipo: [tipo, Validators.required],
      nombre: ['', Validators.required],
      items: this.fb.array([])
    };
    if (tipo === 'receta') {
      group.baseComponenteId = [null, Validators.required];
      group.codigoComponente = [''];
    } else if (tipo === 'personalizada') {
      group.codigoComponente = [''];
    }
    return this.fb.group(group);
  }

  /** Agrega una nueva sección al formulario */
  addSeccion(tipo: string) {
    console.log(this.secciones);
    const nuevaSeccion = this.createSeccion(tipo);
    this.secciones.push(nuevaSeccion);
  }

  /** Elimina una sección */
  removeSeccion(index: number): void {
    this.secciones.removeAt(index);
  }

  /** Obtiene el FormArray de ítems dentro de una sección */
  getItems(seccionIndex: number): FormArray {
    return this.secciones.at(seccionIndex).get('items') as FormArray;
  }

  /** Crea un FormGroup para un ítem (insumo) */
  createItem(): FormGroup {
    return this.fb.group({
      insumoId: [null, Validators.required],
      cantidad: [null, Validators.required],
    });
  }

  /** Agrega un ítem al FormArray de la sección indicada */
  addItem(seccionIndex: number): void {
    const items = this.getItems(seccionIndex);
    items.push(this.createItem());
  }

  /** Elimina un ítem de una sección */
  removeItem(seccionIndex: number, itemIndex: number): void {
    this.getItems(seccionIndex).removeAt(itemIndex);
  }

  /**
   * Cuando se selecciona una receta, se actualiza el nombre, se asigna el baseComponenteId y se rellenan los ítems.
   */
  onRecetaChange(seccionIndex: number, recetaId: number): void {
    const receta = this.recetas.find(r => r.id === recetaId);
    if (receta) {
      const seccion = this.secciones.at(seccionIndex);
      seccion.patchValue({
        nombre: `${receta.nombre}`,
        baseComponenteId: receta.id
      });
      const itemsArray = this.getItems(seccionIndex);
      itemsArray.clear();
      receta.componentes.forEach(component => {
        itemsArray.push(this.fb.group({
          insumoId: component.insumoId,
          cantidad: component.cantidad,
        }));
      });
    }
  }

  /**
   * Genera un código aleatorio para secciones personalizadas.
   */
  generateRandomCode(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `CMP-${randomNum}`;
  }

  /**
   * Abre el diálogo de confirmación.
   * – Para cada sección personalizada se asigna un código y se fija la opción de agregar a lista en true.
   */
  openConfirmDialog(): void {
    this.customSectionCodes = {};
    this.customSectionAdd = {};
    const seccionesArray = this.skidForm.get('secciones') as FormArray;
    seccionesArray.controls.forEach((seccion, index) => {
      if (seccion.get('tipo')?.value === 'personalizada') {
        const code = seccion.get('codigoComponente')?.value || this.generateRandomCode();
        seccion.patchValue({ codigoComponente: code });
        this.customSectionCodes[index] = code;
        this.customSectionAdd[index] = true; // Por defecto, marcar para agregar
      } else {
        this.customSectionCodes[index] = '';
        this.customSectionAdd[index] = false;
      }
    });
    this.confirmDialogVisible = true;
  }

  /**
   * Transforma el valor del formulario para enviar solo los campos necesarios.
   */
  transformSkidValue(): any {
    const formValue = this.skidForm.value;
    const transformedSecciones = formValue.secciones.map((sec: any, index: number) => {
      const base: any = {
        nombre: sec.nombre,
        items: sec.items.map((item: any) => ({
          insumoId: item.insumoId,
          cantidad: item.cantidad
        }))
      };
      if (sec.tipo === 'receta') {
        base.baseComponenteId = sec.baseComponenteId;
      } else if (sec.tipo === 'personalizada' && sec.baseComponenteId) {
        base.baseComponenteId = sec.baseComponenteId;
      }
      return base;
    });
    
    return {
      nombre: formValue.nombre,
      codigo: formValue.codigo,
      imagen: formValue.imagen,
      tipo: formValue.tipo,
      lts: formValue.lts,
      secciones: transformedSecciones
    };
  }

  /**
   * Al confirmar, para cada sección personalizada marcada para agregar,
   * se crea el componente (receta) vía servicio y se actualiza su baseComponenteId.
   * Luego se envían los datos transformados.
   */
  confirmCreateSkid(): void {
    const createCustomPromises = (this.skidForm.get('secciones') as FormArray).controls.map((sec, index) => {
      if (sec.get('tipo')?.value === 'personalizada' && this.customSectionAdd[index]) {
        const newComponente = {
          nombre: sec.get('nombre')?.value,
          codigo: this.customSectionCodes[index], // Este se usa para visualización y para crear la receta
          componentes: sec.get('items')?.value
        };
        return this.recetaService.createReceta(newComponente).toPromise().then((res: any) => {
          sec.patchValue({ baseComponenteId: res.data ? res.data.id : res.id });
        });
      } else {
        return Promise.resolve();
      }
    });
  
    Promise.all(createCustomPromises).then(() => {
      this.sendSkid();
    }).catch(err => {
      console.error('Error al crear componentes personalizados', err);
    });
  }

  /** Envía los datos transformados al backend */
  sendSkid(): void {
    const transformedData = this.transformSkidValue();
    const formData = new FormData();
    formData.append('nombre', transformedData.nombre);
    formData.append('codigo', transformedData.codigo);
    formData.append('tipo', transformedData.tipo);
    formData.append('lts', transformedData.lts);
    if (transformedData.imagen) {
      formData.append('imagen', transformedData.imagen);
    }
    formData.append('secciones', JSON.stringify(transformedData.secciones));
    this.productoFabricadoService.createSkid(formData).subscribe(response => {
      this.initForm();
      this.imagePreview = null;
      this.selectedFile = [];
      this.imagePreviews = [];
      this.fetchSkids();
      this.confirmDialogVisible = false;
    });
  }
  /** Muestra el detalle de un Skid en un diálogo */
  viewDetail(skid: ProductoFabricado): void {
    this.selectedSkid = skid;
    this.displayDetail = true;
  }

  resetForm(): void {
    this.initForm();
    this.imagePreview = null;
    this.selectedFile = [];
    this.imagePreviews = [];
  }

  /** Al hacer submit, se valida y se abre el diálogo de confirmación */
  onSubmit(): void {
    if (this.skidForm.invalid) {
      this.skidForm.markAllAsTouched();
      return;
    }
    this.openConfirmDialog();
  }

  /** Métodos para obtener detalles del artículo (insumo) */
  getArticuloById(id: number): Articulo | null {
    return this.articulos.find(art => art.id === id) || null;
  }
  getArticuloName(id: number): string {
    const art = this.getArticuloById(id);
    return art ? art.name : 'N/A';
  }
  getArticuloCode(id: number): string {
    const art = this.getArticuloById(id);
    return art ? art.code : 'N/A';
  }

  /** Gestión de la expansión de filas en el diálogo */
  onRowExpand(event: any) {
    const seccion = event.data;
    this.expandedRows[seccion.nombre] = true;
  }
  onRowCollapse(event: any) {
    const seccion = event.data;
    delete this.expandedRows[seccion.nombre];
  }

  
  openImageDialog(url: string): void {
    this.enlargedImageUrl = url;
    this.imageDialogVisible = true;
  }
}
