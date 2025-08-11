import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';


// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Layout
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

// Servicios
import { AuthService } from '../service/auth.service';
import { UserService } from '../../pages/service/user.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        RouterModule, FormsModule,
        ButtonModule, CheckboxModule, InputTextModule, PasswordModule, RippleModule,
        ToastModule,
        AppFloatingConfigurator, CommonModule
    ],
    providers: [MessageService],
    styles: [`
    :host { display:block; min-height:100vh; }
:host {
  .wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    background-image:
      linear-gradient(180deg, var(--surface-0), var(--surface-50)),
      radial-gradient(1200px 600px at 10% 20%, rgba(99,102,241,.08), transparent 60%),
      radial-gradient(1000px 700px at 90% 80%, rgba(14,165,233,.09), transparent 60%),
      url('/assets/image/fondoLogin.jpg'); /* <— con / al inicio */
    background-size: auto, auto, auto, cover;
    background-position: center, 10% 20%, 90% 80%, center;
    background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
    background-attachment: scroll, scroll, scroll, fixed;
  }
}
    .card {
      width: 100%; max-width: 840px; border-radius: 28px;
      background: linear-gradient(180deg, var(--surface-0), var(--surface-50));
      box-shadow: 0 20px 60px rgba(0,0,0,.08), 0 2px 10px rgba(0,0,0,.04);
      overflow:hidden;
      display:grid; grid-template-columns: 1.2fr 1fr;
    }
    .left {
      padding: 2.2rem 2rem 2rem 2.2rem; position:relative;
      display:flex; flex-direction:column; justify-content:center;
    }
    .brand {
      display:flex; align-items:center; gap:.8rem; margin-bottom:1.2rem;
    }
    .brand .logo {
      width:56px; height:56px; border-radius:14px; object-fit:cover;
      box-shadow: 0 8px 24px rgba(0,0,0,.10);
    }
    .brand .title {
      font-size:1.6rem; font-weight:800; letter-spacing:.3px;
    }
    .left h2 { margin:.25rem 0 1.25rem; font-size:1.35rem; font-weight:700; }
    .left p.muted { color: var(--text-color-secondary); margin-top:-.5rem; margin-bottom:1.25rem; }

    .field { margin-bottom: 1rem; }
    .field label { display:block; margin-bottom:.35rem; font-weight:600; }
    .p-inputtext, .p-password, .p-password input { width:100%; }
    .p-invalid { border-color: var(--red-400)!important; }

    .row-between { display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin:.25rem 0 1rem; }
    .remember { display:flex; align-items:center; gap:.5rem; }

    .submit { margin-top:.75rem; }
    .submit .p-button { width:100%; height: 44px; font-weight:700; border-radius:12px; }

    .right {
      background: linear-gradient(145deg, rgba(59,130,246,.12), rgba(14,165,233,.12));
      display:flex; align-items:center; justify-content:center; padding:2rem;
    }
    .panel {
      background: linear-gradient(135deg, var(--primary-400), var(--primary-600));
      color: var(--primary-color-text);
      border-radius: 22px;
      width: 100%; height: 100%;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      text-align:center; padding:2rem;
      box-shadow: inset 0 1px 18px rgba(255,255,255,.15);
    }
    .panel h3 { margin:0 0 .5rem; font-weight:800; }
    .panel p { opacity:.95; max-width: 260px; }

    @media (max-width: 840px) {
      .card { grid-template-columns: 1fr; }
      .right { display:none; }
    }
  `],
    template: `
    <app-floating-configurator />

    <div class="wrap">
      <div class="card">
        <!-- Columna Izquierda -->
        <div class="left">
          <div class="brand">
            <img src="assets/image/logo.jpg" alt="Logo" class="logo" />
            <div class="title">Dosisur</div>
          </div>

          <h2>Bienvenido</h2>
          <p class="muted">Ingresá tus credenciales para continuar.</p>

          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              pInputText
              type="email"
              [(ngModel)]="email"
              [ngClass]="{'p-invalid': emailTouched && !emailValid}"
              placeholder="tu@empresa.com"
              autocomplete="username"
              (blur)="emailTouched = true"
            />
          </div>

          <div class="field">
            <label for="password">Contraseña</label>
            <p-password
              id="password"
              [(ngModel)]="password"
              [ngClass]="{'p-invalid': passTouched && !passwordValid}"
              placeholder="••••••••"
              [toggleMask]="true"
              [feedback]="false"
              inputStyleClass="w-full"
              autocomplete="current-password"
              (onBlur)="passTouched = true"
            ></p-password>
          </div>

          <div class="row-between">
            <div class="remember">
              <p-checkbox [(ngModel)]="remember" binary inputId="remember"></p-checkbox>
              <label for="remember">Recordar email</label>
            </div>
            <!-- quitado “Olvidó su contraseña?” como pediste -->
          </div>

          <div class="submit">
            <button
              pButton
              type="button"
              label="Ingresar"
              class="p-button-lg"
              [loading]="loading"
              [disabled]="loading || !formValid"
              (click)="login()"
            ></button>
          </div>
        </div>

        <!-- Columna Derecha (ilustrativa) -->
        <div class="right">
          <div class="panel">
            <h3>Gestión Inteligente</h3>
            <p>Controlá tus módulos, pedidos y stock con una experiencia rápida y moderna.</p>
          </div>
        </div>
      </div>
    </div>

    <p-toast position="top-right" [baseZIndex]="99999"></p-toast>
  `
})
export class Login implements OnInit {
    email = '';
    password = '';
    remember = false;
    loading = false;

    // flags UI para validación
    emailTouched = false;
    passTouched = false;

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private messageService: MessageService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // cargar email recordado (si existe)
        const saved = localStorage.getItem('login:email');
        if (saved) { this.email = saved; this.remember = true; }
    }

    // soporte Enter en todo el componente
    @HostListener('document:keydown.enter', ['$event'])
    onEnter(ev: KeyboardEvent) {
        // evita doble submit cuando se está cargando
        if (!this.loading) this.login();
    }

    // getters de validación
    get emailValid() { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim()); }
    get passwordValid() { return this.password.trim().length >= 4; }
    get formValid() { return this.emailValid && this.passwordValid; }

    login() {
        this.emailTouched = true;
        this.passTouched = true;

        if (!this.formValid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Datos inválidos',
                detail: 'Revisá el email y la contraseña.',
                life: 2500
            });
            return;
        }

        this.loading = true;
        const credentials = { email: this.email.trim(), password: this.password };

        this.authService.login(credentials).pipe(
            // guardá el token en tu AuthService; el interceptor añadirá Authorization
            switchMap(() => this.userService.loadMe()),
            catchError((err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de autenticación',
                    detail: err?.error?.message || 'Email o contraseña incorrectos',
                    life: 3000
                });
                return of(null);
            }),
            finalize(() => this.loading = false)
        ).subscribe((me) => {
            if (!me) return;

            // recordar email si corresponde
            if (this.remember) localStorage.setItem('login:email', this.email.trim());
            else localStorage.removeItem('login:email');

            this.messageService.add({
                severity: 'success',
                summary: 'Bienvenido',
                detail: `Sesión iniciada`,
                life: 1500
            });

            this.router.navigate(['/']); // dashboard
        });
    }
}
