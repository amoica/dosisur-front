import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { PickListModule } from 'primeng/picklist';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';

import { RolesService } from '../service/role.service';
import { Role } from './role.interface';
import { Permission } from './permission.interface';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CheckboxModule,
    PickListModule,
    CardModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers:[ConfirmationService, MessageService],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  permissions: Permission[] = [];

  availablePerms: Permission[] = [];
  selectedPerms: Permission[] = [];

  editDialog = false;
  editing = false;
  selectedRole?: Role;

  form = new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    description: new FormControl<string>('', { nonNullable: true }),
    isSystem: new FormControl<boolean>(false, { nonNullable: true })
  });

  viewDialog = false;
  viewRole?: Role;
  viewPermissionsList: Permission[] = [];

  constructor(private svc: RolesService) {}

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.svc.getRoles().subscribe(list => (this.roles = list));
  }

  loadPermissions() {
    this.svc.getAllPermissions().subscribe(perms => {
      this.permissions = perms;
      this.availablePerms = [...perms];
      this.selectedPerms = [];
    });
  }

  openNew() {
    this.editing = false;
    this.selectedRole = undefined;
    this.form.reset({ name: '', description: '', isSystem: false });
    this.availablePerms = [...this.permissions];
    this.selectedPerms = [];
    this.editDialog = true;
  }

  openEdit(role: Role) {
    this.editing = true;
    this.selectedRole = role;
    this.form.setValue({
      name: role.name,
      description: role.description || '',
      isSystem: role.isSystem
    });
    this.selectedPerms = this.permissions.filter(p =>
      role.permissionIds?.includes(p.id)
    );
    this.availablePerms = this.permissions.filter(
      p => !role.permissionIds?.includes(p.id)
    );
    this.editDialog = true;
  }

  onPermsTransfer(event: any) {
    this.availablePerms = event.source;
    this.selectedPerms = event.target;
  }

  save() {
    if (this.form.invalid) return;
    const { name, description, isSystem } = this.form.value;
    const dto: Partial<Role> = {
      name,
      description,
      isSystem,
      permissionIds: this.selectedPerms.map(p => p.id)
    };

    const action = this.editing && this.selectedRole
      ? this.svc.updateRole(this.selectedRole.id, dto)
      : this.svc.createRole(dto);

    action.subscribe(() => {
      this.loadRoles();
      this.editDialog = false;
    });
  }

  viewPermissions(role: Role) {
    this.svc.getPermissionsByRole(role.id).subscribe(rps => {
      this.viewPermissionsList = rps.map(rp => rp.permission);
      this.viewRole = role;
      this.viewDialog = true;
    });
  }

  closeEdit() { this.editDialog = false; }
  closeView() { this.viewDialog = false; }
}
