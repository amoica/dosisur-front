import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Articulo, ArticuloServiceService } from '../service/articulo-service.service';
import { Receta, RecetaArticulo, RecetaService } from '../service/receta.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { PickListModule } from 'primeng/picklist';
import { FileUpload } from 'primeng/fileupload';
import { Select, SelectModule} from 'primeng/select';
import { SpellCheckService } from '../../core/service/spell-check.service';

@Component({
  selector: 'app-receta',
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
    PickListModule,
    FileUpload,
    SelectModule
  ],
  templateUrl: './receta.component.html',
  styleUrls: ['./receta.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class RecetaComponent implements OnInit {
  activeTab: 'create' | 'list' = 'create';
  recetaForm: { name: string; code: string, tipo: string | null } = { name: '', code: '', tipo: null };
  availableArticulos: any[] = [];
  allArticulosBackup: any[] = [];
  selectedArticulos: any[] = [];
  recetas: any[] = [];
  selectedImage: string | null = null;

  // Variables de edición
  displayEditDialog = false;
  editingReceta: any | null = null;
  dialogEditMode = false;
  newTipo: string = '';
  showNewTipoDialog: boolean = false;
  showValidationDialog: boolean = false; // Para el diálogo de validación profesional

  suggestions: string[] = [];



  tipos: any[] = [];

  constructor(
    private recetaService: RecetaService,
    private articuloService: ArticuloServiceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private spellCheckService: SpellCheckService
  ) {}

  ngOnInit(): void {
    this.fetchArticulos();
    this.fetchRecetas();
    
  }

  fetchArticulos(): void {
    this.articuloService.getArticulos().subscribe({
      next: (data: any) => {
        this.availableArticulos = data.data?.map((art: any) => ({
          ...art,
          quantity: 0,
          unidad: art.unidad || 'N/A',
        })) || [];
        this.allArticulosBackup = [...this.availableArticulos];
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los artículos.',
        });
      }
    });
  }

  fetchRecetas(): void {
    this.recetaService.getRecetas().subscribe({
      next: (data: any) => {
        this.recetas = data.data || data;
        // Extrae los valores de tipo de cada receta que no sean null.
        this.tipos = Array.from(new Set(
          this.recetas
            .filter((receta: any) => receta.tipo != null)
            .map((receta: any) => receta.tipo)
        ));
        this.tipos.push('Agregar Nuevo...'); // Agrega la opción para agregar un nuevo tipo.
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las recetas.',
        });
      }
    });
  }

  onTipoChange(event: any) {
    if (event.value && event.value === 'Agregar Nuevo...') {
      this.newTipo = '';
      this.showNewTipoDialog = true;
    }
  }
  // Este método se encarga de obtener las sugerencias en tiempo real mientras el usuario escribe
  onTipoInputChange(): void {

  }

  // Permite que, al hacer clic en una sugerencia, se complete automáticamente el campo
  selectSuggestion(suggestion: string): void {
    this.newTipo = suggestion;
    this.suggestions = [];
  }

 
  acceptNewTipo(): void {
    const trimmedTipo = this.newTipo.trim().toLowerCase();
    if (!trimmedTipo) {
      return; // No hace nada si el input está vacío
    }
    
    const { valid, suggestions } = this.spellCheckService.checkWord(trimmedTipo);
    
    // Si la palabra no es válida y existen sugerencias, muestra el diálogo de confirmación
    if (!valid && suggestions && suggestions.length) {
      // Utilizamos el diálogo de confirmación para darle al usuario la opción de aceptar la palabra tal como está,
      // o cancelar y corregirla.
      this.confirmationService.confirm({
        header: 'Posible Error Ortográfico',
        icon: 'pi pi-exclamation-triangle',
        message: `La palabra "${trimmedTipo}" parece estar mal escrita.\nSugerencias: ${suggestions.join(', ')}\n¿Desea continuar de todas formas?`,
        acceptLabel: 'Sí, continuar',
        rejectLabel: 'Cancelar',
        accept: () => {
          // El usuario elige proceder con la palabra ingresada
          this.addTipo(trimmedTipo);
        },
        reject: () => {
          // El usuario cancela para corregir la entrada, se puede dejar como está para que modifique manualmente
        }
      });
    } else {
      // Si la palabra es válida o no hay sugerencias, se agrega directamente
      this.addTipo(trimmedTipo);
    }
  }

  addTipo(tipo: string): void {
    // Inserta el nuevo tipo justo antes de la opción "Agregar Nuevo..."
    this.tipos.splice(this.tipos.length - 1, 0, tipo);
    // Asigna el nuevo tipo al modelo del formulario
    this.recetaForm.tipo = tipo;
    // Cierra el modal y resetea los valores
    this.showNewTipoDialog = false;
    this.newTipo = '';
  }

  cancelNewTipo(): void {
    this.showNewTipoDialog = false;
    this.recetaForm.tipo = null;
    this.newTipo = '';
  }

  onDialogHide(): void {
    if (this.recetaForm.tipo === 'Agregar Nuevo...') {
      this.recetaForm.tipo = null;
    }
    this.newTipo = '';
  }


  setActiveTab(tab: 'create' | 'list'): void {
    this.activeTab = tab;
    if (tab === 'create') this.resetForm();
  }

  getTotalCantidad(): number {
    return this.selectedArticulos.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  saveReceta(): void {
    if (!this.recetaForm.name.trim() || !this.recetaForm.code.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Complete nombre y código.',
      });
      return;
    }

    const newComponente = {
      nombre: this.recetaForm.name,
      codigo: this.recetaForm.code,
      tipo: this.recetaForm.tipo || undefined,
      componentes: this.selectedArticulos.map(item => ({
        insumoId: item.id,
        cantidad: item.quantity,
      })),
    };

    this.recetaService.createReceta(newComponente).subscribe({
      next: (response: any) => {
        this.recetas.push(response.data || response);
        this.messageService.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'Componente creado exitosamente.',
        });
        this.resetForm();
        this.activeTab = 'list';
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear el componente.',
        });
      }
    });
  }

  resetForm(): void {
    this.recetaForm = { name: '', code: '', tipo: '' };
    this.selectedArticulos = [];
    this.availableArticulos = [...this.allArticulosBackup];
    this.selectedImage = null;
  }

  cancelEdit(): void {
    this.displayEditDialog = false;
    this.editingReceta = null;
    this.dialogEditMode = false;
    this.resetForm();
  }

  onFileSelected(event: any): void {
    const file: File = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  confirmDelete(receta: any): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el componente "${receta.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteReceta(receta);
      }
    });
  }

  deleteReceta(receta: any): void {
    if (!receta.id) return;
    this.recetaService.deleteReceta(receta.id).subscribe({
      next: () => {
        this.recetas = this.recetas.filter(r => r.id !== receta.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminada',
          detail: 'El componente se eliminó correctamente.',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el componente.',
        });
      }
    });
  }

  editReceta(receta: any): void {
    this.editingReceta = { ...receta };
    this.recetaForm = { name: receta.nombre, code: receta.codigo, tipo: receta.tipo };
    this.selectedArticulos = receta.componentes.map((comp:any) => ({
      ...comp.insumo,
      quantity: comp.cantidad
    }));
    this.displayEditDialog = true;
    this.dialogEditMode = false;
  }

  enableDialogEdit(): void {
    this.dialogEditMode = true;
  }

  confirmUpdate(): void {
    this.confirmationService.confirm({
      message: `¿Deseas actualizar el componente "${this.recetaForm.name}"?`,
      header: 'Confirmar Actualización',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.updateReceta();
      }
    });
  }

  updateReceta(): void {
    if (!this.editingReceta) return;

    const updatedComponente = {
      id: this.editingReceta.id,
      nombre: this.recetaForm.name,
      codigo: this.recetaForm.code,
      componentes: this.selectedArticulos.map(item => ({
        insumoId: item.id,
        cantidad: item.quantity,
      })),
    };

    this.recetaService.updateReceta(updatedComponente).subscribe({
      next: (response: any) => {
        const index = this.recetas.findIndex(r => r.id === updatedComponente.id);
        if (index !== -1) {
          this.recetas[index] = response.data || response;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Componente actualizado correctamente.',
        });
        this.cancelEdit();
        this.fetchRecetas();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo actualizar el componente: ${err.error}`,
        });
      }
    });
  }
}