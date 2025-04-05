import { Routes } from '@angular/router';
import { SkidCreatorComponent } from './skid-creator.component';


export default [
    {
        path: 'skid',
        children: [
            {
                path: '', component: SkidCreatorComponent
            },
            /*{
                path: ':id', component: ArticuloDetailsComponent
            }*/
        ]
    },


] as Routes;
