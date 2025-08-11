import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-reporte',
  imports: [SkeletonModule, ButtonModule, FluidModule],
  standalone:true,
  templateUrl: './reporte.component.html',
  styleUrl: './reporte.component.scss'
})
export class ReporteComponent {

}
