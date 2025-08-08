import { Routes } from '@angular/router';
import { YacimientoComponent } from './yacimiento.component';


export default [
    {
        path: 'yacimiento',
        children: [
            {
                path: '', component: YacimientoComponent
            },
            /*{
                path: ':id', component: ArticuloDetailsComponent
            }*/
        ]
    },


] as Routes;
