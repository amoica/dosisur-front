// src/app/core/models/api.interface.ts

/**
 * Respuesta paginada estándar de la API
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Parámetros para listado paginado
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: any;
  search?: string;
}

/**
 * Opciones para requests HTTP
 */
export interface RequestOptions {
  headers?: { [key: string]: string };
  params?: { [key: string]: any };
  reportProgress?: boolean;
  responseType?: 'json' | 'arraybuffer' | 'blob' | 'text';
  withCredentials?: boolean;
}