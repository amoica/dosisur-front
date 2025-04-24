import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

interface DashboardItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  standalone: true,
  selector: 'app-mega-dashboard',
  imports: [CommonModule, ButtonModule, CardModule],
  template: `
    <div class="mega-dashboard-container">
      <!-- Hero Banner (Compacto) -->
      <div class="hero-banner">
        <h1 class="hero-title">Bienvenido, Operador Dosisur</h1>
        <p class="hero-subtitle">Panel de control</p>
      </div>

      <!-- Grid de Accesos Directos -->
      <div class="shortcuts-grid">
        <div
          class="shortcut-card"
          *ngFor="let item of items; let i = index"
          (click)="goTo(item.route)"
          title="{{ item.label }}"
        >
          <div class="icon-circle">
            <i [ngClass]="item.icon"></i>
          </div>
          <span>{{ item.label }}</span>
        </div>
      </div>

      <!-- Sección Extra (opcional): Resumen o Widgets Adicionales -->
      <div class="extra-section">
        <h2 class="extra-title">Visión General del Día</h2>
        <p class="extra-subtitle">
          Aquí puedes mostrar gráficos, tablas o información resumida de lo más reciente.
        </p>
        <!-- Aquí podrías incluir un widget de gráfico, tabla, etc. -->
      </div>
    </div>
  `,
  styles: [`
    /* ===========================================================
       1. Contenedor Principal y Hero Banner
    =========================================================== */
    .mega-dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .hero-banner {
      background: linear-gradient(135deg, #eef2f7, #c9d2df);
      border-radius: 10px;
      text-align: center;
      color: #2c3e50;
      padding: 1.5rem;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .hero-title {
      margin: 0;
      font-size: 2rem;
      font-weight: bold;
    }
    .hero-subtitle {
      margin-top: 0.5rem;
      font-size: 1.1rem;
      color: #6c757d;
    }

    /* ===========================================================
       2. Grid de Accesos Directos
    =========================================================== */
    .shortcuts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1.5rem;
      width: 100%;
      margin: 0 auto;
      justify-items: center;
    }
    .shortcut-card {
      background: #fff;
      border-radius: 12px;
      width: 140px;
      height: 140px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
      text-align: center;
    }
    .shortcut-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }
    .shortcut-card span {
      margin-top: 0.5rem;
      font-weight: 600;
      font-size: 0.95rem;
      color: #2c3e50;
    }

    /* Ícono Circular */
    .icon-circle {
      width: 50px;
      height: 50px;
      background-color: #2c3e50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.3rem;
      transition: background-color 0.3s;
    }
    .shortcut-card:hover .icon-circle {
      background-color: #1f2e44;
    }

    /* ===========================================================
       3. Sección Extra (Opcional)
    =========================================================== */
    .extra-section {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      padding: 1.5rem;
      text-align: center;
    }
    .extra-title {
      margin: 0;
      font-size: 1.6rem;
      color: #2c3e50;
    }
    .extra-subtitle {
      margin: 0.5rem 0 1rem;
      color: #6c757d;
    }

    /* ===========================================================
       4. Responsividad
    =========================================================== */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 1.8rem;
      }
      .shortcut-card {
        width: 110px;
        height: 110px;
      }
      .icon-circle {
        width: 40px;
        height: 40px;
        font-size: 1.1rem;
      }
    }
  `]
})
export class DashboardWidget {
  constructor(private router: Router) {}

  // Aquí defines todos los accesos directos que deseas:
  items: DashboardItem[] = [
    //{ label: 'Dashboard', icon: 'pi pi-home', route: 'dashboard' },
    //{ label: 'Usuarios', icon: 'pi pi-user', route: 'usuarios' },
    { label: 'Clientes', icon: 'pi pi-users', route: 'gestion-clientes/cliente' },
    { label: 'Proveedores', icon: 'pi pi-briefcase', route: 'gestion-proveedor/proveedor' },
    //{ label: 'Ventas', icon: 'pi pi-dollar', route: 'ventas' },
    { label: 'Pedidos', icon: 'pi pi-file', route: 'gestion-general/pedidos' },
    //{ label: 'O. de Compra', icon: 'pi pi-shopping-cart', route: 'ordenes-compra' },
    //{ label: 'Solicitudes', icon: 'pi pi-send', route: 'solicitudes' },
    { label: 'Artículos', icon: 'pi pi-box', route: 'gestion-articulos/articulo' },
    { label: 'Skids', icon: 'pi pi-sitemap', route: 'gestion-skids/skid' },
    { label: 'Componentes', icon: 'pi pi-sliders-h', route: '/gestion-recetas/receta' },
    //{ label: 'Depósito', icon: 'pi pi-inbox', route: 'deposito' },
    //{ label: 'Movimientos', icon: 'pi pi-exchange', route: 'movimientos' },
    //{ label: 'Fabricación', icon: 'pi pi-cog', route: 'fabricacion' },
    //{ label: 'Notificaciones', icon: 'pi pi-bell', route: 'notificaciones' },
    //{ label: 'Perfil', icon: 'pi pi-id-card', route: 'perfil' },
    //{ label: 'Configuración', icon: 'pi pi-cog', route: 'configuracion' }
  ];

  goTo(route: string) {
    // Ajusta la navegación a tus rutas
    this.router.navigate([`/${route}`]);
  }
}
