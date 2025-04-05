import { Component, OnInit, ViewChild } from '@angular/core';
import { ArticuloServiceService } from '../../service/articulo-service.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { ProveedorService } from '../../service/proveedor.service'; // Asegúrate de tener este servicio
import { Router } from '@angular/router';
import { FloatLabel } from 'primeng/floatlabel';
import { InputIconModule } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { FileUpload } from 'primeng/fileupload';

interface InsumoProveedor {
  proveedorId: number;
  codigoProveedor: string;
  // Se dejará el precioUnitario como null hasta que se actualice con cotización
  precioUnitario?: number | null;
}

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-articulo',
  standalone: true,
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
    InputTextModule,
    FormsModule,
    DropdownModule,
    TextareaModule,
    FloatLabel,
    InputIconModule,
    Select,
    FileUpload,
    ToastModule
  ],
  templateUrl: './articulo.component.html',
  styleUrls: ['./articulo.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class ArticuloComponent implements OnInit {

  @ViewChild(FileUpload) fileUpload!: FileUpload;
  articulos: any[] = [];
  articulo: any = {};
  loading: boolean = true;
  articuloDialog: boolean = false;
  articuloForm!: FormGroup;
  globalFilter: string = ''; // Para el buscador global
  uploadedFiles: any[] = [];

  // Para la relación Insumo-Proveedor
  insumoProveedores: InsumoProveedor[] = [];
  insumoProveedorDialog: boolean = false;
  insumoProveedor: InsumoProveedor = { proveedorId: 0, codigoProveedor: '' };
  imagenFile: File | null = null;

  unitsOptions = [
    { label: 'Metros (m)', value: 'm' },
    { label: 'Centímetros (cm)', value: 'cm' },
    { label: 'Milímetros (mm)', value: 'mm' },
    { label: 'Kilogramos (kg)', value: 'kg' },
    { label: 'Gramos (g)', value: 'g' },
    { label: 'Miligramos (mg)', value: 'mg' },
    { label: 'Litros (L)', value: 'L' },
    { label: 'Mililitros (mL)', value: 'mL' },
    { label: 'Unidades', value: 'unidades' },
    { label: 'Docenas', value: 'docenas' },
    { label: 'Pares', value: 'pares' },
    { label: 'Cajas', value: 'cajas' },
    { label: 'Paquetes', value: 'paquetes' },
    { label: 'Botellas', value: 'botellas' },
    { label: 'Galones', value: 'galones' },
    { label: 'Pulgadas (in)', value: 'in' },
    { label: 'Toneladas', value: 'toneladas' },
    // Agrega o quita unidades según lo necesites
  ];

  // Lista de proveedores para el dropdown (se carga desde ProveedorService)
  proveedoresList: any[] = [];

  imageDialogVisible: boolean = false;
  selectedImage: string = '';

  constructor(
    private articuloService: ArticuloServiceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private proveedorService: ProveedorService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchArticulos();
    this.initForm();
    this.loadProveedoresList();
  }

  initForm() {
    this.articuloForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: ['', Validators.required],
      sinonimo: [''], // opcional
      minimunStock: [0, [Validators.min(0)]],
      unidad: ['', Validators.required],
      isInventoriable: [false],
      available: [true],
      imagenUrl: [''], // opcional
    });
  }

  openImageDialog(imagenUrl: string) {
    this.selectedImage = imagenUrl;
    this.imageDialogVisible = true;
  }

  onFileSelected(event: any) {
    if (event.files && event.files.length > 0) {
      this.imagenFile = event.files[0]; // Almacena el archivo seleccionado
      const reader = new FileReader();
      reader.onload = () => {
        this.articulo.imageUrl = reader.result as string;
      };
      reader.readAsDataURL(this.imagenFile!);
    }
  }

  removeImage() {
    this.imagenFile = null;
    this.articulo.imagenUrl = '';
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }


  loadProveedoresList() {
    // Se asume que el servicio de proveedores devuelve un arreglo de proveedores
    this.proveedorService.getProveedores().subscribe({
      next: (data: any) => {
        this.proveedoresList = data; // Ajusta según la respuesta
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar los proveedores',
          detail: 'No se pudieron cargar los proveedores',
        });
      },
    });
  }

  fetchArticulos() {
    this.loading = true;
    this.articuloService.getArticulos().subscribe({
      next: (data: any) => {
        // Se asume que la respuesta tiene una propiedad "data" con los artículos
        this.articulos = data.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar artículos',
          detail: 'No se pudieron cargar los artículos.',
        })
      },
    });
  }

  showArticuloDialog() {
    this.articulo = {};
    this.articuloForm.reset({
      name: '',
      code: '',
      description: '',
      sinonimo: '',
      unidad: '',
      minimunStock: 0,
      isInventoriable: false,
      available: true,
    });
    // Vaciar la relación de proveedores al crear un nuevo artículo
    this.insumoProveedores = [];
    this.articuloDialog = true;
  }

  editArticulo(articulo: any) {
    this.articulo = { ...articulo };
    this.articuloForm.patchValue(this.articulo);
    // Se asume que el backend devuelve la relación de insumo-proveedor en "insumoProveedor"
    this.insumoProveedores = articulo.insumoProveedor || [];
    this.articuloDialog = true;
  }

  hideArticuloDialog() {
    this.articuloDialog = false;
  }

  saveArticulo() {
    if (this.articuloForm.invalid) {
      this.articuloForm.markAllAsTouched();
      return;
    }

    const formValues = this.articuloForm.value;

    // Crear un FormData para enviar los datos junto con la imagen
    const formData = new FormData();
    formData.append('name', formValues.name);
    formData.append('code', formValues.code);
    formData.append('description', formValues.description);
    formData.append('unidad', formValues.unidad);
    formData.append('minimunStock', formValues.minimunStock);
    formData.append('isInventoriable', formValues.isInventoriable);
    formData.append('available', formValues.available);

    // Si se seleccionó una imagen, la adjuntas
    if (this.imagenFile) {
      formData.append('imageFile', this.imagenFile);
    }

    // Agregar la relación de proveedores
    formData.append('proveedores', JSON.stringify(this.insumoProveedores));


    // Según si es creación o edición:
    if (this.articulo.id) {
      this.articuloService.updateArticulo(this.articulo.id, formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Artículo actualizado',
            detail: 'Se actualizó con éxito.',
          });
          this.fetchArticulos();
          this.hideArticuloDialog();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error al actualizar',
            detail: err?.message || 'No se pudo actualizar el artículo.',
          });
        },
      });
    } else {
      this.articuloService.createArticulo(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Artículo creado',
            detail: 'Se creó con éxito.',
          });
          this.fetchArticulos();
          this.hideArticuloDialog();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error al crear',
            detail: err?.message || 'No se pudo crear el artículo.',
          });
        },
      });
    }
  }

  // Método para eliminar un artículo
  deleteArticulo(id: number, name: string) {
    this.confirmationService.confirm({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar el artículo "${name}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.articuloService.deleteArticulo(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Artículo eliminado',
              detail: 'Se eliminó correctamente.',
            });
            this.fetchArticulos();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error al eliminar',
              detail: err?.message || 'No se pudo eliminar el artículo.',
            });
          },
        });
      },
    });
  }

  // Métodos para la relación Insumo-Proveedor

  openNewInsumoProveedor() {
    this.insumoProveedor = { proveedorId: 0, codigoProveedor: '' };
    this.insumoProveedorDialog = true;
  }

  editInsumoProveedor(rel: InsumoProveedor) {
    // Copia el objeto para editar
    this.insumoProveedor = { ...rel };
    this.insumoProveedorDialog = true;
  }

  saveInsumoProveedor() {
    if (!this.insumoProveedor.proveedorId || !this.insumoProveedor.codigoProveedor.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe seleccionar un proveedor y completar el código.',
      });
      return;
    }
    // Si ya existe una relación para ese proveedor, actualizarla; de lo contrario, agregarla
    const index = this.insumoProveedores.findIndex(r => r.proveedorId === this.insumoProveedor.proveedorId);
    if (index !== -1) {
      this.insumoProveedores[index] = { ...this.insumoProveedor };
    } else {
      this.insumoProveedores.push({ ...this.insumoProveedor });
    }
    this.closeInsumoProveedorDialog();
  }

  deleteInsumoProveedor(rel: InsumoProveedor) {
    this.insumoProveedores = this.insumoProveedores.filter(r => r.proveedorId !== rel.proveedorId);
  }

  closeInsumoProveedorDialog() {
    this.insumoProveedorDialog = false;
  }

  // Método para obtener el nombre del proveedor a partir de la relación
  getProveedorName(rel: InsumoProveedor): string {
    const prov = this.proveedoresList.find(p => p.id === rel.proveedorId);
    return prov ? prov.nombre : rel.proveedorId.toString();
  }

  // Método para navegar al detalle del artículo (icono "eye")
  goToDetail(id: number) {
    // Aquí se implementa la navegación al detalle del artículo
    this.router.navigate(['/gestion-articulos', 'articulo', id]);
    // Por ejemplo: this.router.navigate(['/insumos/detail', id]);
  }


}
