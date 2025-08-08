import { Cliente } from "../service/cliente.service";

export interface Yacimiento {
  id?: number;                       // opcional en creación
  nombre: string;                    // obligatorio, mejor no opcional
  ubicacion?: string;
  lat?: number;
  lon?: number;
  clienteId: number;                 // obligatorio, para forzar selección
  cliente?: Pick<Cliente, 'id'|'nombre'>;  // usa tu modelo Cliente
}