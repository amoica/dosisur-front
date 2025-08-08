import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule }  from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule }   from 'primeng/card';
import { TableColumn }  from '../../model/table-config.interface';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, CardModule],
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss']
})
export class GenericTableComponent implements OnChanges {
  @Input() title = '';
  @Input() description = '';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() showAddButton = true;
  @Input() customActionsTemplate?: TemplateRef<any>;

  @Output() onAdd    = new EventEmitter<void>();
  @Output() onView   = new EventEmitter<any>();
  @Output() onEdit   = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  globalFilterFields: string[] = [];

  ngOnChanges(ch: SimpleChanges) {
    if (ch['columns']) {
      this.globalFilterFields = this.columns.map(c => c.field);
    }
  }

  getColumnValue(row: any, field: string) {
    return field.split('.').reduce((o, k) => o?.[k], row) ?? '—';
  }
}
