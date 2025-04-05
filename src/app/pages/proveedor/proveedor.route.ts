import { Routes } from '@angular/router';
import { ProveedorComponent } from './proveedor.component';
import { ProveedorDetailsComponent } from './proveedor-details/proveedor-details.component';



export default [
    {
        path: 'proveedor',
        children: [
            {
                path: '',
                component: ProveedorComponent,
            },
            {
                path: ':id',
                component: ProveedorDetailsComponent
            }
        ]

    },
] as Routes;
