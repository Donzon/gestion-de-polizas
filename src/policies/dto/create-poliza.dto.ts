import {
  IsString,
  IsNumber,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreatePolizaDto {
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT es obligatorio' })
  @Matches(/^\d+-[\dkK]$/, {
    message: 'El RUT debe tener el formato válido (ej: 12345678-9)',
  })
  @MinLength(8, { message: 'El RUT debe tener al menos 8 caracteres' })
  @MaxLength(12, { message: 'El RUT no puede tener más de 12 caracteres' })
  rutTitular: string;

  @IsString({ message: 'El plan de salud debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El plan de salud es obligatorio' })
  @MinLength(2, {
    message: 'El plan de salud debe tener al menos 2 caracteres',
  })
  @MaxLength(50, {
    message: 'El plan de salud no puede tener más de 50 caracteres',
  })
  planSalud: string;

  @IsNumber({}, { message: 'La prima debe ser un número' })
  @IsNotEmpty({ message: 'La prima es obligatoria' })
  @Min(1000, { message: 'La prima mínima es $1,000' })
  @Max(1000000, { message: 'La prima máxima es $1,000,000' })
  prima: number;
}
