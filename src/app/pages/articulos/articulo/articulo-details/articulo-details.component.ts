import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Articulo, ArticuloServiceService } from '../../../service/articulo-service.service';
import { CommonModule, Location } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-articulo-details',
  imports: [
    CommonModule,
    TabViewModule,
    TableModule,
    CardModule
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
        this.articulo = data;
        console.log(this.articulo);
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
