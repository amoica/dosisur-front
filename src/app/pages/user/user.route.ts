import { Routes } from '@angular/router';
import { UserComponent } from './user.component';


export default [
    {
        path: 'users',
        children: [
            {
                path: '', component: UserComponent
            },
            /*{
                path: ':id', component: ArticuloDetailsComponent
            }*/
        ]
    },


] as Routes;
