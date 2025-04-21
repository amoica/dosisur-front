import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RecetaService } from '../../../service/receta.service';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { ArticuloServiceService } from '../../../service/articulo-service.service';

interface Articulo { id: number; name: string; }

@Component({
  selector: 'app-formulas',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FieldsetModule,
    ReactiveFormsModule 
  ],
  templateUrl: './formulas.component.html',
  styleUrls: ['./formulas.component.scss']
})
export class FormulasComponent implements OnInit {

  @Input() idComponente = 0;

  articulos: Articulo[] = [];
  nombreComponente = '';
  recetaForm: FormGroup;
  coleccionItems: Articulo[]= [];
  

  constructor(
    private recetaService: RecetaService,
    private fb: FormBuilder,
    private articuloService: ArticuloServiceService
  ) {
    // 2) Ahora sí podemos usar fb
    this.recetaForm = this.fb.group({
      items: this.fb.array<FormGroup>([])
    });

  }

  ngOnInit(): void {
    this.recetaService.getRecetaById(this.idComponente).subscribe(data => {
      this.nombreComponente = data.nombre;
      // Suponemos data.componentes = [{ insumo: {id,name}, cantidad }, ...]
      this.articulos = data.componentes.map((c: any) => c.insumo);
      this.initItems(data.componentes);
    });


    this.loadArticulos();

    
  }

  loadArticulos(){
    this.articuloService.getArticulos().subscribe((data: any)=>{
      this.coleccionItems = data.data;
      console.log(this.coleccionItems);
    })
  }

  get items(): FormArray {
    return this.recetaForm.get('items') as FormArray;
  }

  private initItems(componentes: any[]) {
    componentes.forEach(comp => {
      this.items.push(this.fb.group({
        insumoId:   [comp.insumo.id, Validators.required],
        cantidad:   [comp.cantidad, [Validators.required, Validators.min(1)]],
        confirmed:  [true]
      }));
    });
  }

  addItem(): void {
    this.items.push(this.fb.group({
      insumoId:   [null, Validators.required],
      cantidad:   [1,     [Validators.required, Validators.min(1)]],
      confirmed:  [false]
    }));
  }

  confirmItem(index: number): void {
    const fg = this.items.at(index) as FormGroup;
    if (fg.valid) {
      fg.patchValue({ confirmed: true });
    } else {
      fg.markAllAsTouched();
    }
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

   /** Ya no limitemos la búsqueda a `articulos` */
   getItemName(id: number): string {
    const all = [...this.coleccionItems, ...this.articulos];
    const art = all.find(a => a.id === id);
    return art ? art.name : '—';
  }

  getSnapshot() {
    return this.items.controls.map((fg, index) => {
      const group = fg as FormGroup;
      return {
        insumoId: group.get('insumoId')?.value,
        cantidad: group.get('cantidad')?.value
      };
    });
  }
}
