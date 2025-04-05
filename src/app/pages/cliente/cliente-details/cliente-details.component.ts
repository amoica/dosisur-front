import { Component } from '@angular/core';
import { Cliente, ClienteService } from '../../service/cliente.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-cliente-details',
  imports: [CommonModule, TableModule, TabsModule, TabViewModule],
  templateUrl: './cliente-details.component.html',
  styleUrl: './cliente-details.component.scss'
})
export class ClienteDetailsComponent {
  cliente: Cliente = {} as Cliente ; // Cliente actual

  constructor(
    private route: ActivatedRoute,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    // Leer el :id de la URL y cargar
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clienteService.getClienteById(id).subscribe((data) => {
      this.cliente = data;
      // data debería incluir, si deseas, tickets, etc.
    });
  }
}
