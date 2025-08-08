/**
 * Configuración de una columna de la tabla
 */
export interface TableColumn {
  field: string; // Nombre del campo en los datos
  header: string; // Título a mostrar
  sortable?: boolean; // Si es ordenable (true por defecto)
  filterable?: boolean; // Si es filtrable (true por defecto)
  width?: string; // Ancho de columna (ej: '100px')
  align?: 'left' | 'center' | 'right'; // Alineación del contenido
  dataType?: 'text' | 'number' | 'date' | 'boolean' | 'currency'; // Tipo de dato para formateo
  format?: string; // Formato adicional (ej: 'dd/MM/yyyy' para fechas)
  transform?: (value: any, row?: any) => any; // Función para transformar el valor
  styleClass?: string | ((row: any) => string); // Clases CSS condicionales
  headerStyleClass?: string; // Clases CSS para el encabezado
}

/**
 * Configuración completa de la tabla
 */
export interface TableConfig {
  title: string; // Título principal
  description?: string; // Descripción/Subtítulo
  columns: TableColumn[]; // Columnas a mostrar
  showAddButton?: boolean; // Mostrar botón de agregar
  addButtonLabel?: string; // Texto del botón agregar
  rowsPerPage?: number; // Items por página
  globalFilterFields?: string[]; // Campos para búsqueda global
  rowActions?: TableRowAction[]; // Acciones por fila
  selectionMode?: 'single' | 'multiple' | null; // Modo de selección
  contextMenu?: boolean; // Habilitar menú contextual
  exportEnabled?: boolean; // Habilitar exportación
}

/**
 * Acciones disponibles por fila
 */
export interface TableRowAction {
  icon: string; // Icono de PrimeNG (ej: 'pi pi-pencil')
  label?: string; // Texto del botón
  styleClass?: string; // Clases CSS
  command: (row: any) => void; // Función a ejecutar
  tooltip?: string; // Texto del tooltip
  visible?: (row: any) => boolean; // Visibilidad condicional
  disabled?: (row: any) => boolean; // Deshabilitado condicional
}