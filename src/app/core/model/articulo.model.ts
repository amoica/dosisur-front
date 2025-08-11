export interface InsumoProveedor {
  proveedorId: number;
  codigoProveedor: string;
  precioUnitario?: number | null;
  fechaActualizacion: string | Date; // viene string ISO; si querés lo mapeamos a Date
  proveedor?: { id: number; nombre: string };
}

// Tal cual viene del backend (naming/nullable)
export interface ArticuloDto {
  id: number;
  name: string;
  code: string;
  description: string;
  minimunStock: number | null;            // en tu JSON es null
  available: boolean;
  unidad: string;
  isInventoriable: boolean;
  imagenUrl: string;
  sinonimo: string;
  createdAt: string;                      // ISO string
  updatedAt: string;                      // ISO string
  categoriaId: number | null;
  insumoProveedor: InsumoProveedor[];
}

// Opcional: modelo “de dominio” si querés fechas como Date y nombres consistentes
export interface Articulo {
  id: number;
  name: string;
  code: string;
  description: string;
  minimunStock: number | null;
  available: boolean;
  unidad: string;
  isInventoriable: boolean;
  imagenUrl: string;
  sinonimo: string;
  createdAt: Date;
  updatedAt: Date;
  categoriaId: number | null;
  insumoProveedor: InsumoProveedor[];
}