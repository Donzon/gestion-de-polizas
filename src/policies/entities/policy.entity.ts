export class Policy {
  id: string; // UUID
  rutTitular: string;
  fechaEmision: Date; // ISODate
  planSalud: string;
  prima: number;
  estado: 'emitida' | 'activa' | 'anulada';
}
