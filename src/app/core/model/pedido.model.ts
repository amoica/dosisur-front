export interface Pedido {
  id: number;
  codigo: string;
  estado: 'CREADA' | 'APROBADA' | 'EN_PROCESO' | string;
  fechaEmision?: string;
  fechaEntrega?: string;
  cantidad?: number;
  observaciones?: string;
  productoFabricadoId: number;
  nroPresupuesto?: string | number;
  // lo importante para este caso:
  snapshotSkid?: any; // si querés, tipalo fino después
  pedidoCliente?: {
    numero?: string;
    cliente?: { nombre?: string };
    contacto?: { nombre?: string; email?: string; telefono?: string };
    adjunto?: string | number;

  };
  yacimiento?: { nombre?: string };
}