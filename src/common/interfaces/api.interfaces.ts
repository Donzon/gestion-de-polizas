/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Respuesta de error
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}
