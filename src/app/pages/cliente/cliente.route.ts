import { Routes } from '@angular/router';
import { ClienteComponent } from './cliente.component';
import { ClienteDetailsComponent } from './cliente-details/cliente-details.component';



export default [
    {
        path: 'cliente',
        children: [
          {
            path: '',
            component: ClienteComponent, // Lista de clientes
          },
          {
            path: ':id',
            component: ClienteDetailsComponent, // Detalle de un cliente
          },
        ],
      },
    ] as Routes;
