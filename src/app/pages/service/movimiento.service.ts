import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MovimientoService {
  clientes = [
    { id: 1, name: 'YPF' },
    { id: 2, name: 'Contreras Hermanos' },
    { id: 3, name: 'Petrolera Pampa' },
    { id: 4, name: 'Shell Argentina' },
    { id: 5, name: 'Pan American Energy' },
    { id: 6, name: 'Petrobras' },
    { id: 7, name: 'Tecpetrol' },
    { id: 8, name: 'Pluspetrol' },
  ];

  depositos = [
    { id: 1, name: 'Depósito Central', ciudad: 'Neuquén' },
    { id: 2, name: 'Depósito Secundario', ciudad: 'Cipolletti' },
    { id: 3, name: 'Depósito Norte', ciudad: 'Añelo' },
    { id: 4, name: 'Depósito Sur', ciudad: 'Rincón de los Sauces' },
  ];

  articulos = [
    { id: 1, name: 'Tubo de PVC', code: 'ART001', stock: 100 },
    { id: 2, name: 'Llave Inglesa', code: 'ART002', stock: 50 },
    { id: 3, name: 'Compresor', code: 'ART003', stock: 20 },
    { id: 4, name: 'Martillo', code: 'ART004', stock: 70 },
    { id: 5, name: 'Taladro', code: 'ART005', stock: 30 },
    { id: 6, name: 'Tornillo', code: 'ART006', stock: 500 },
    { id: 7, name: 'Tuerca', code: 'ART007', stock: 400 },
    { id: 8, name: 'Batería', code: 'ART008', stock: 25 },
    { id: 9, name: 'Válvula de seguridad', code: 'ART009', stock: 15 },
    { id: 10, name: 'Manguera de alta presión', code: 'ART010', stock: 40 },
    { id: 11, name: 'Codo de acero', code: 'ART011', stock: 35 },
    { id: 12, name: 'Brida de acero', code: 'ART012', stock: 28 },
    { id: 13, name: 'Manómetro', code: 'ART013', stock: 18 },
    { id: 14, name: 'Filtro de aceite', code: 'ART014', stock: 60 },
  ];

  productosFabricados = [
    { id: 1, name: 'Kit Solar', code: 'PROD001', componentes: [{ id: 1, name: 'Panel Solar', cantidad: 2 }, { id: 8, name: 'Batería', cantidad: 1 }] },
    { id: 2, name: 'Riego Automático', code: 'PROD002', componentes: [{ id: 10, name: 'Manguera de alta presión', cantidad: 1 }, { id: 3, name: 'Compresor', cantidad: 1 }] },
    { id: 3, name: 'Kit de Extracción', code: 'PROD003', componentes: [{ id: 1, name: 'Tubo de PVC', cantidad: 10 }, { id: 6, name: 'Tornillo', cantidad: 20 }, { id: 7, name: 'Tuerca', cantidad: 20 }] },
    { id: 4, name: 'Sistema de Bombeo', code: 'PROD004', componentes: [{ id: 2, name: 'Llave Inglesa', cantidad: 1 }, { id: 9, name: 'Válvula de seguridad', cantidad: 1 }] },
    { id: 5, name: 'Equipo de Montaje', code: 'PROD005', componentes: [{ id: 4, name: 'Martillo', cantidad: 1 }, { id: 5, name: 'Taladro', cantidad: 1 }] },
    { id: 6, name: 'Sistema de Filtrado', code: 'PROD006', componentes: [{ id: 14, name: 'Filtro de aceite', cantidad: 2 }, { id: 13, name: 'Manómetro', cantidad: 1 }] },
    { id: 7, name: 'Tubería de Alta Presión', code: 'PROD007', componentes: [{ id: 11, name: 'Codo de acero', cantidad: 4 }, { id: 12, name: 'Brida de acero', cantidad: 4 }] },
    { id: 8, name: 'Kit de Seguridad', code: 'PROD008', componentes: [{ id: 8, name: 'Batería', cantidad: 1 }, { id: 9, name: 'Válvula de seguridad', cantidad: 1 }, { id: 7, name: 'Tuerca', cantidad: 10 }] },
  ];

  responsables = [
    { id: 1, name: 'Juan Pérez' },
    { id: 2, name: 'María López' },
    { id: 3, name: 'Carlos Ramírez' },
    { id: 4, name: 'Ana Fernández' },
    { id: 5, name: 'Luis González' },
    { id: 6, name: 'Patricia Martínez' },
    { id: 7, name: 'Fernando Torres' },
  ];

  getClientes() {
    return this.clientes;
  }

  getDepositos() {
    return this.depositos;
  }

  getArticulos() {
    return this.articulos;
  }

  getProductosFabricados() {
    return this.productosFabricados;
  }

  getResponsables() {
    return this.responsables;
  }
}