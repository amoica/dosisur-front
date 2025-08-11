import { Routes } from '@angular/router';
import { ReporteComponent } from './reporte.component';


export default [
    {
        path: 'reportes',
        children: [
            {
                path: '', component: ReporteComponent
            },
            /*{
                path: ':id', component: ArticuloDetailsComponent
            }*/
        ]
    },


] as Routes;
