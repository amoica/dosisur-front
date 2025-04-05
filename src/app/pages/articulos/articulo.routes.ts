import { Routes } from '@angular/router';
import { ArticuloComponent } from './articulo/articulo.component';
import { StockComponent } from './stock/stock.component';
import { MovimientoComponent } from './movimiento/movimiento.component';
import { ArticuloDetailsComponent } from './articulo/articulo-details/articulo-details.component';


export default [
    {path: 'articulo',
        children:[
            {
                path: '', component: ArticuloComponent
            },
            {
                path: ':id', component: ArticuloDetailsComponent
            }
        ]
     },
    {path: 'stock', component: StockComponent},
    {path: 'movimientos', component: MovimientoComponent},

] as Routes;
