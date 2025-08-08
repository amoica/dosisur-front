/**
 * Tipos de campos de formulario disponibles
 */

export type FormFieldType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'password' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea' 
  | 'autocomplete'
  | 'multiselect'
  | 'chip'
  | 'editor'
  | 'file';

/**
 * Opciones para campos de selección
 */
export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
}

/**
 * Configuración de un campo del formulario
 */
export interface FormField {
  key: string; // Nombre de la propiedad en el modelo
  label: string; // Etiqueta del campo
  type: FormFieldType; // Tipo de campo
  required?: boolean; // Si es obligatorio
  disabled?: boolean | ((model: any) => boolean); // Habilitación condicional
  visible?: boolean | ((model: any) => boolean); // Visibilidad condicional
  placeholder?: string; // Texto de placeholder
  icon?: string; // Icono de PrimeNG (ej: 'pi pi-user')
  options?: SelectOption[] | ((model: any) => SelectOption[]); // Opciones para select/radio
  multiple?: boolean; // Para campos que permiten múltiples valores
  minLength?: number; // Validación de longitud mínima
  maxLength?: number; // Validación de longitud máxima
  min?: number; // Valor mínimo para números
  max?: number; // Valor máximo para números
  pattern?: string | RegExp; // Patrón de validación
  errorMessages?: { [key: string]: string }; // Mensajes de error personalizados
  styleClass?: string; // Clases CSS adicionales
  group?: string; // Agrupación de campos
  columns?: number; // Ancho en columnas (para layouts responsivos)
}

/**
 * Configuración completa del formulario
 */
export interface FormConfig {
  title: string; // Título del formulario
  description?: string; // Descripción/Subtítulo
  fields: FormField[]; // Campos del formulario
  groups?: FormGroup[]; // Grupos de campos (para pestañas/acordeones)
  layout?: 'vertical' | 'horizontal' | 'grid'; // Diseño del formulario
  submitLabel?: string; // Texto del botón enviar
  cancelLabel?: string; // Texto del botón cancelar
  styleClass?: string; // Clases CSS para el contenedor
}

/**
 * Grupo de campos (para organizar en pestañas/acordeones)
 */
export interface FormGroup {
  name: string;
  label: string;
  icon?: string;
  fields: string[]; // Keys de los campos que incluye
  expanded?: boolean;
}