import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { DialogModule }    from 'primeng/dialog';
import { ButtonModule }    from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule }  from 'primeng/checkbox';
import { DropdownModule }  from 'primeng/dropdown';

@Component({
  selector: 'app-generic-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    DropdownModule
  ],
  templateUrl: './generic-form.component.html',
  styleUrls: ['./generic-form.component.scss']
})
export class GenericFormComponent {
  @Input() visible:    boolean = false;
  @Input() title:      string  = '';
  @Input() formFields: any[]   = [];
  @Input() formData:   any     = {};

  @Output() save   = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  onSave()   { this.save.emit(this.formData); }
  onCancel() { this.cancel.emit(); }

  getOptions(field: any): any[] {
    if (typeof field.options === 'function') {
      return field.options(this.formData);
    } else if (Array.isArray(field.options)) {
      return field.options;
    }
    return [];
  }
}
