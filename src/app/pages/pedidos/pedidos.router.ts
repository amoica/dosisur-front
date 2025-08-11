import { Routes } from '@angular/router';
import { PedidosComponent } from './pedidos/pedidos.component';
import { PedidoFabricacionComponent } from './pedido-fabricacion/pedido-fabricacion.component';
import { PedidoFacade } from './pedido-fabricacion/pedido.facade';
import { OrdenFabricacionService } from '../service/orden-fabricacion.service';
import { ProductoFabricadoService } from '../service/producto-fabricado.service';
import { RecetaService } from '../service/receta.service';
import { ArticuloServiceService } from '../service/articulo-service.service';



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
        ],
        providers:[PedidoFacade]

    },
] as Routes;
