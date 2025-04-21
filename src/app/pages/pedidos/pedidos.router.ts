import { Routes } from '@angular/router';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PedidoFabricacionComponent } from './pedido-fabricacion/pedido-fabricacion.component';



export default [
    {
        path: 'pedidos',
        children: [
            
            {
                path: '',
                component: PedidosComponent,
            },
            {
                path: ':id',
                component: PedidoFabricacionComponent
            },
        ]

    },
] as Routes;
