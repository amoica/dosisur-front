import { Routes } from '@angular/router';
import { RolesComponent } from './roles.component';


export default [
    {
        path: 'roles',
        children: [
            {
                path: '', component: RolesComponent
            },
            /*{
                path: ':id', component: ArticuloDetailsComponent
            }*/
        ]
    },


] as Routes;
