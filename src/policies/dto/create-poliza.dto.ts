export class CreatePolizaDto {
  rutTitular: string;
  planSalud: string;
  prima: number;
  // NO incluimos id ni fechaEmision porque se generan automáticamente
  // estado se inicializa como 'emitida' por defecto
}
