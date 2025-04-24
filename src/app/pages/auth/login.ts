import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../service/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, ToastModule],
    providers: [MessageService],
    styles:`
    .login-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
    `,
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                       <div class="text-center mb-8 flex flex-col items-center justify-center">
  <img src="assets/image/logo.jpg" alt="Logo" class="login-logo" />
  <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mt-6">Bienvenidos</div>
  <span class="text-muted-color font-medium">Inicia sesión para continuar</span>
</div>

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Recordar credenciales</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Olvido su contraseña?</span>
                            </div>
                            <p-button label="Ingresar" styleClass="w-full" (onClick)="login()"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login implements OnInit {
    email: string = '';

    password: string = '';

    checked: boolean = false;

    constructor(
        private authService: AuthService,
        private messageService: MessageService,
        private router: Router) {

    }

    ngOnInit(): void {

    }

    login() {
        if (!this.email || !this.password || !this.validateEmail(this.email)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Datos inválidos',
                detail: 'Por favor ingrese un correo y contraseña válidos',
            });
            return;
        }

        const credentials = {
            email: this.email,
            password: this.password,
        };

        this.authService.login(credentials).subscribe({
            next: (resp) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Bienvenido',
                    detail: 'Inicio de sesión exitoso',
                });
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de autenticación',
                    detail: 'Email o contraseña incorrectos',
                });
            },
        });
    }


    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


}
