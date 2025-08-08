import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';  // <-- Asegúrate de importarlo en tu AppModule

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

// Servicios & modelos
import { UserService } from '../service/user.service';
import { User } from './user.interface';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Role } from '../roles/role.interface';
import { RolesService } from '../service/role.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    CardModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];

  // Dialog
  dialogVisible = false;
  isEdit = false;
  formData: any = {
    email: '',
    password: '',
    roleId: null,
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    address: ''
  };

  // Avatar
  uploadedAvatar: File | null = null;
  avatarPreview: string | ArrayBuffer | null = null;

  roleOptions: { label: string; value: number }[] = [];

  constructor(
    private userSvc: UserService,
    private roleSvc: RolesService,
    private msg: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadAll();
    this.loadRoles();
  }

  loadAll() {
    this.userSvc.getAll().subscribe({
      next: users => this.users = users,
      error: err => this.showError('Error al cargar usuarios', err)
    });
  }

  loadRoles() {
    this.roleSvc.getRoles().subscribe({
      next: roles => {
        this.roles = roles;
        this.roleOptions = roles.map(r => ({ label: r.name, value: r.id }));
      },
      error: err => this.showError('Error al cargar roles', err)
    });
  }

  openNew() {
    this.isEdit = false;
    this.resetForm();
    this.dialogVisible = true;
  }

  openEdit(user: User) {

    console.log(user);
    this.isEdit = true;
    this.formData = {
      id: user.id,
      email: user.email,
      password: '',
      roleId: user.role?.id,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      dni: user.profile?.dni || '',
      phone: user.profile?.phone || '',
      address: user.profile?.address || ''
    };
    this.avatarPreview = user.profile?.avatarUrl || null;
    this.uploadedAvatar = null;
    this.dialogVisible = true;
  }

  hideDialog() {
    this.dialogVisible = false;
  }

  resetForm() {
    this.formData = {
      email: '',
      password: '',
      roleId: null,
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      address: ''
    };
    this.uploadedAvatar = null;
    this.avatarPreview = null;
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
      return this.showError('Formato no soportado', 'Solo JPG/PNG');
    }
    if (file.size > 1_000_000) {
      return this.showError('Archivo muy grande', 'Máx. 1 MB');
    }

    this.uploadedAvatar = file;
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview = reader.result;
    reader.readAsDataURL(file);
  }

  saveUser() {
    // 1) Montar FormData
    const payload = { ...this.formData };
    const form = new FormData();
    form.append('user', JSON.stringify(payload));
    if (this.uploadedAvatar) {
      form.append('avatarUrl', this.uploadedAvatar, this.uploadedAvatar.name);
    }

    // 2) LLamada HTTP
    const obs = this.isEdit
      ? this.userSvc.updateUserFormData(this.formData.id, form)
      : this.userSvc.createUserFormData(form);

    obs.subscribe({
      next: () => {
        this.showSuccess(this.isEdit ? 'Usuario actualizado' : 'Usuario creado');
        this.loadAll();
        this.hideDialog();
      },
      error: (err:any) => this.showError('Error al guardar usuario', err)
    });
  }


  confirmDelete(user: User) {
    this.confirm.confirm({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar al usuario ${user.email}? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userSvc.delete(user.id).subscribe({
          next: () => {
            this.showWarn('Usuario eliminado');
            this.loadAll();
          },
          error: (err) => this.showError('Error al eliminar usuario', err)
        });
      }
    });
  }

  resetPassword(userId: number) {
    this.confirm.confirm({
      header: 'Resetear contraseña',
      message: '¿Estás seguro de resetear la contraseña de este usuario? Se enviará un correo con instrucciones.',
      icon: 'pi pi-key',
      accept: () => {
        this.userSvc.resetPassword(userId).subscribe({
          next: () => this.showSuccess('Contraseña reseteada. Se ha enviado un correo al usuario.'),
          error: (err) => this.showError('Error al resetear contraseña', err)
        });
      }
    });
  }

  // Helpers
  getRoleColor(roleName: string | undefined): string {
    if (!roleName) return '#6B7280';
    
    switch(roleName.toLowerCase()) {
      case 'admin': return '#8B5CF6';
      case 'editor': return '#10B981';
      default: return '#3B82F6';
    }
  }

  // Notification helpers
  private showSuccess(message: string) {
    this.msg.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 3000
    });
  }

  private showWarn(message: string) {
    this.msg.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message,
      life: 3000
    });
  }

  private showError(summary: string, error: any) {
    this.msg.add({
      severity: 'error',
      summary: summary,
      detail: error.message || 'Error desconocido',
      life: 5000
    });
  }
}