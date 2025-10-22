/**
 * Estados posibles de una póliza
 */
export type PolicyStatus = 'emitida' | 'activa' | 'anulada';

/**
 * Transiciones de estado permitidas
 */
export const POLICY_STATUS_TRANSITIONS = {
  'emitida': 'activa',
  'activa': 'anulada',
  'anulada': null
} as const;
