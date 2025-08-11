import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-paneles-editor',
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, InputTextModule, ButtonModule],
  template: `
     <div formArrayName="paneles" class="of-rows">
    <div class="of-row" *ngFor="let row of paneles.controls; trackBy: trackById; let i = index" [formGroupName]="i">
      <p-dropdown class="of-grow"
        [options]="options"
        optionLabel="name" optionValue="id"
        [virtualScroll]="true" [virtualScrollItemSize]="itemSize"
        [filter]="true" filterBy="name"
        formControlName="insumoId" placeholder="Panel">
      </p-dropdown>

      <input pInputText type="number" min="1" formControlName="cantidad" class="of-qty">
      <button pButton type="button" icon="pi pi-trash" severity="danger" (click)="remove.emit(i)"></button>
    </div>
  </div>
  `,
  styleUrl: './paneles-editor.component.scss'
})
export class PanelesEditorComponent {

  @Input({required: true}) paneles!: FormArray;
  @Input({required: true}) options!: Array<{id: number; name:string}>;
  @Input() itemSize = 36;
  @Output() remove = new EventEmitter<number>();


  //crea un id interno por fila al crear el form

  trackById = (_:number, ctrl: AbstractControl) => (ctrl as any).__uid ?? ctrl;

}
