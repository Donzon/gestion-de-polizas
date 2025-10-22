/**
 * Filtros para búsqueda de pólizas
 */
export interface PolicyFilters {
  estado?: string;
  fechaEmision?: string;
}

/**
 * Parámetros de consulta para el controlador
 */
export interface QueryParams {
  estado?: string;
  fechaEmision?: string;
}
