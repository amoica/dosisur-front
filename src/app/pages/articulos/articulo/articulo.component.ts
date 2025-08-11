import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ConfirmationService, MessageService } from 'primeng/api';
import { LazyLoadEvent } from 'primeng/api';
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
import { FloatLabel } from 'primeng/floatlabel';
import { InputIconModule } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { FileUpload } from 'primeng/fileupload';
import { TableLazyLoadEvent } from 'primeng/table';

import { ArticuloServiceService } from '../../service/articulo-service.service';
import { ProveedorService } from '../../service/proveedor.service';

interface InsumoProveedor {
  proveedorId: number;
  codigoProveedor: string;
  precioUnitario?: number | null;
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
    ToastModule,
  ],
  templateUrl: './articulo.component.html',
  styleUrls: ['./articulo.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class ArticuloComponent implements OnInit {

  @ViewChild(FileUpload) fileUpload!: FileUpload;

  // tabla
  articulos: any[] = [];
  loading = true;
  rows = 10;
  totalRecords = 0;

  // dialog + form
  articuloDialog = false;
  articuloForm!: FormGroup;
  articulo: any = {};

  // imagen
  imagenFile: File | null = null;
  imageDialogVisible = false;
  selectedImage = '';

  // proveedores
  proveedoresList: any[] = [];
  insumoProveedores: InsumoProveedor[] = [];
  insumoProveedorDialog = false;
  insumoProveedor: InsumoProveedor = { proveedorId: 0, codigoProveedor: '' };

  // categorías
  categoriasList: any[] = [];

  // unidades
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
  ];

  constructor(
    private articuloService: ArticuloServiceService,
    private proveedorService: ProveedorService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProveedoresList();
    this.loadCategoriasList();
    this.loadArticulosLazy({ first: 0, rows: this.rows, globalFilter: '' });
  }

  initForm() {
    this.articuloForm = this.fb.group({
      // ¡NO mandamos id en el body!
      categoriaId: [null],          // usar dropdown
      categoriaNombre: [''],        // crear nueva por nombre (opcional)
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      sinonimo: [''],
      minimunStock: [0, [Validators.min(0)]],
      unidad: ['', Validators.required],
      isInventoriable: [false],
      available: [true],
      imagenUrl: [''],
    });
  }

  // ------- Loads -------

  loadArticulosLazy(event: TableLazyLoadEvent ) {
    this.loading = true;
    const limit = event.rows ?? this.rows;
    const first = event.first ?? 0;
    const page = Math.floor(first / limit) + 1;
    const search = (event.globalFilter as string) || '';

    this.articuloService.getArticulos({ page, limit, search }).subscribe({
      next: (resp: any) => {
        this.articulos = resp.data;
        this.totalRecords = resp.meta.total;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar artículos',
          detail: err?.message || 'Revise su conexión',
        });
      }
    });
  }

  loadProveedoresList() {
    this.proveedorService.getProveedores().subscribe({
      next: (data: any) => {
        this.proveedoresList = data?.data ?? data; // adaptá a tu respuesta real
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar los proveedores',
          detail: 'No se pudieron cargar los proveedores',
        });
      },
    });
  }

  loadCategoriasList() {
    this.articuloService.getCategorias().subscribe({
      next: (data: any) => {
        this.categoriasList = data?.data ?? data; // adaptá a tu respuesta real
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar categorías',
          detail: 'No se pudieron cargar las categorías',
        });
      },
    });
  }

  fetchArticulos() {
    this.loading = true;
    this.articuloService.getArticulos({ page: 1, limit: this.rows, search: '' }).subscribe({
      next: (resp: any) => {
        this.articulos = resp.data;
        this.totalRecords = resp.meta.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al cargar artículos',
          detail: 'No se pudieron cargar los artículos.',
        });
      },
    });
  }

  // ------- Dialogs -------

  showArticuloDialog() {
    this.articulo = {};
    this.articuloForm.reset({
      categoriaId: null,
      categoriaNombre: '',
      name: '',
      code: '',
      description: '',
      sinonimo: '',
      unidad: '',
      minimunStock: 0,
      isInventoriable: false,
      available: true,
      imagenUrl: ''
    });
    this.insumoProveedores = [];
    this.imagenFile = null;
    if (this.fileUpload) this.fileUpload.clear();
    this.articuloDialog = true;
  }

  editArticulo(articulo: any) {
    this.articulo = { ...articulo };
    this.articuloForm.patchValue({
      categoriaId: articulo?.categoria?.id ?? null,
      categoriaNombre: '',
      name: articulo.name,
      code: articulo.code,
      description: articulo.description,
      sinonimo: articulo.sinonimo,
      unidad: articulo.unidad,
      minimunStock: articulo.minimunStock ?? 0,
      isInventoriable: !!articulo.isInventoriable,
      available: !!articulo.available,
      imagenUrl: articulo.imagenUrl || ''
    });
    this.insumoProveedores = articulo.insumoProveedor || [];
    this.imagenFile = null;
    if (this.fileUpload) this.fileUpload.clear();
    this.articuloDialog = true;
  }

  hideArticuloDialog() {
    this.articuloDialog = false;
  }

  openImageDialog(imagenUrl: string) {
    this.selectedImage = imagenUrl;
    this.imageDialogVisible = true;
  }

  onFileSelected(event: any) {
    if (event.files && event.files.length > 0) {
      this.imagenFile = event.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        // vista previa
        this.articulo.imagenUrl = reader.result as string;
      };
      reader.readAsDataURL(this.imagenFile!);
    }
  }

  removeImage() {
    this.imagenFile = null;
    this.articulo.imagenUrl = '';
    this.articuloForm.patchValue({ imagenUrl: '' });
    if (this.fileUpload) this.fileUpload.clear();
  }

  // ------- Save/Delete -------

  saveArticulo() {
    if (this.articuloForm.invalid) {
      this.articuloForm.markAllAsTouched();
      return;
    }

    const {
      categoriaId,
      categoriaNombre,
      ...rest
    } = this.articuloForm.value;

    // payload base
    const payload: any = {
      ...rest,
      proveedores: this.insumoProveedores,
    };

    if (categoriaId) payload.categoriaId = Number(categoriaId);
    else if (categoriaNombre?.trim()) payload.categoriaNombre = categoriaNombre.trim();

    const isEdit = !!this.articulo?.id;

    // Si usás archivo, usamos FormData y serializamos el array de proveedores
    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (k === 'proveedores') {
        formData.append('proveedores', JSON.stringify(v));
      } else {
        formData.append(k, v as string);
      }
    });
    if (this.imagenFile) formData.append('imageFile', this.imagenFile);

    const obs$ = isEdit
      ? this.articuloService.updateArticulo(this.articulo.id, formData) // id en URL
      : this.articuloService.createArticulo(formData);

    obs$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: isEdit ? 'Artículo actualizado' : 'Artículo creado',
          detail: 'Operación exitosa.',
        });
        this.fetchArticulos();
        this.hideArticuloDialog();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: isEdit ? 'Error al actualizar' : 'Error al crear',
          detail: err?.message || 'No se pudo completar la operación.',
        });
      },
    });
  }

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

  // ------- Relación Insumo-Proveedor -------

  openNewInsumoProveedor() {
    this.insumoProveedor = { proveedorId: 0, codigoProveedor: '' };
    this.insumoProveedorDialog = true;
  }

  editInsumoProveedor(rel: InsumoProveedor) {
    this.insumoProveedor = { ...rel };
    this.insumoProveedorDialog = true;
  }

  saveInsumoProveedor() {
    if (!this.insumoProveedor.proveedorId || !this.insumoProveedor.codigoProveedor?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe seleccionar un proveedor y completar el código.',
      });
      return;
    }
    const idx = this.insumoProveedores.findIndex(r => r.proveedorId === this.insumoProveedor.proveedorId);
    if (idx !== -1) this.insumoProveedores[idx] = { ...this.insumoProveedor };
    else this.insumoProveedores.push({ ...this.insumoProveedor });
    this.insumoProveedorDialog = false;
  }

  deleteInsumoProveedor(rel: InsumoProveedor) {
    this.insumoProveedores = this.insumoProveedores.filter(r => r.proveedorId !== rel.proveedorId);
  }

  getProveedorName(rel: InsumoProveedor): string {
    const prov = this.proveedoresList.find(p => p.id === rel.proveedorId);
    return prov ? prov.nombre : rel.proveedorId.toString();
  }

  goToDetail(id: number) {
    this.router.navigate(['/gestion-articulos', 'articulo', id]);
  }
}
