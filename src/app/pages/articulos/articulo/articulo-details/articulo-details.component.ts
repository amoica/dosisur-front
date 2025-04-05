import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Articulo, ArticuloServiceService } from '../../../service/articulo-service.service';
import { CommonModule, Location } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-articulo-details',
  imports: [
    CommonModule,
    TabViewModule,
    TableModule
  ],
  templateUrl: './articulo-details.component.html',
  styleUrls: ['./articulo-details.component.scss']
})
export class ArticuloDetailsComponent implements OnInit {
  articulo: Articulo = {} as Articulo;

  constructor(
    private route: ActivatedRoute,
    private articuloService: ArticuloServiceService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadArticulo(id);
  }

  loadArticulo(id: number): void {
    this.articuloService.getArticuloById(id).subscribe({
      next: (data: any) => {
        console.log('Detalle del artículo:', data);
        this.articulo = data;
      },
      error: (err) => {
        console.error('Error al cargar el artículo:', err);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}
