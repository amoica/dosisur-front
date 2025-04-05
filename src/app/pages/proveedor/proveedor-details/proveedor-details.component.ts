import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Proveedor, ProveedorService } from '../../service/proveedor.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-proveedor-details',
  imports: [CommonModule, TableModule, TabsModule, TabViewModule],
  templateUrl: './proveedor-details.component.html',
  styleUrl: './proveedor-details.component.scss'
})
export class ProveedorDetailsComponent implements OnInit {


  proveedor: Proveedor = {} as Proveedor;

  constructor(
    private route: ActivatedRoute,
    private proveedorService: ProveedorService
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProveedor(id);
  }

  loadProveedor(id: number) {
    this.proveedorService.getProveedorById(id).subscribe((data) => {
      console.log(data);
      this.proveedor = data;
    });
  }

}
