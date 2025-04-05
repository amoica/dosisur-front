import { Routes } from '@angular/router';
import { RecetaComponent } from './receta.component';


export default [
    {
        path: 'receta',
        children: [
            {
                path: '', component: RecetaComponent
            },
            /*{
                path: ':id', component: ArticuloDetailsComponent
            }*/
        ]
    },


] as Routes;
