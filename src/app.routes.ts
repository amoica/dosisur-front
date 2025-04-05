import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'gestion-articulos', loadChildren: () => import('./app/pages/articulos/articulo.routes') },
            { path: 'gestion-recetas', loadChildren: () => import('./app/pages/receta/receta.route') },
            { path: 'gestion-skids', loadChildren: () => import('./app/pages/skid-creator/skid-creator.route') },
            { path: 'gestion-clientes', loadChildren: () => import('./app/pages/cliente/cliente.route') },
            { path: 'gestion-depositos', loadChildren: () => import('./app/pages/deposito/deposito.route') },
            { path: 'gestion-proveedor', loadChildren: () => import('./app/pages/proveedor/proveedor.route') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
