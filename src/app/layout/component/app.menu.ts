import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Gestión General',
                items: [
                   
                    { label: 'Stock', icon: 'pi pi-fw pi-objects-column', routerLink: ['/gestion-articulos/stock'] },
                    { label: 'Pedidos', icon: 'pi pi-fw pi-clipboard', routerLink: ['/gestion-general/pedidos'] }
                ]
            },
            {
                label: 'Gestión Entidades',
                items: [
                    { label: 'Articulos', icon: 'pi pi-fw pi-box', routerLink: ['/gestion-articulos/articulo'] },
                    { label: 'Componentes', icon: 'pi pi-fw pi-hammer', routerLink: ['/gestion-recetas/receta'] },
                    { label: 'Skids', icon: 'pi pi-fw pi-th-large', routerLink: ['/gestion-skids/skid'] },
                    { label: 'Clientes', icon: 'pi pi-fw pi-id-card', routerLink: ['/gestion-clientes/cliente'] },
                    { label: 'Depositos', icon: 'pi pi-fw pi-warehouse', routerLink: ['/gestion-depositos/deposito'] },
                    { label: 'Proveedores', icon: 'pi pi-fw pi-truck', routerLink: ['/gestion-proveedor/proveedor'] },

                    //{ label: 'Fabricados', icon: 'pi pi-fw pi-id-card', routerLink: ['/gestion-articulos/fabricado'] },
                ]
            },
        ];
    }
}
