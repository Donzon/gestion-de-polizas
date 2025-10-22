import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePolizaDto } from './dto/create-poliza.dto';
import { UpdatePolizaDto } from './dto/update-poliza.dto';
import { Policy } from './entities/policy.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PoliciesService {
  private readonly policies: Policy[] = [];

  create(createPolizaDto: CreatePolizaDto): Policy {
    const nuevaPolicy: Policy = {
      id: uuidv4(),
      rutTitular: createPolizaDto.rutTitular,
      fechaEmision: new Date(),
      planSalud: createPolizaDto.planSalud,
      prima: createPolizaDto.prima,
      estado: 'emitida',
    };

    this.policies.push(nuevaPolicy);
    return nuevaPolicy;
  }

  findAll(filtros?: { estado?: string; fechaEmision?: string }): Policy[] {
    let resultado = [...this.policies];

    if (filtros?.estado) {
      resultado = resultado.filter(
        (policy) => policy.estado === filtros.estado,
      );
    }

    if (filtros?.fechaEmision) {
      const fechaFiltro = new Date(filtros.fechaEmision);
      resultado = resultado.filter(
        (policy) =>
          policy.fechaEmision.toDateString() === fechaFiltro.toDateString(),
      );
    }

    return resultado;
  }

  findOne(id: string): Policy {
    const policy = this.policies.find((p) => p.id === id);
    if (!policy) {
      throw new NotFoundException(`Policy con ID ${id} no encontrada`);
    }
    return policy;
  }

  updateStatus(id: string): Policy {
    const policy = this.findOne(id);
    
    // Definir la secuencia de estados: emitida -> activa -> anulada
    const secuenciaEstados: Record<string, string | null> = {
      'emitida': 'activa',
      'activa': 'anulada',
      'anulada': null // No se puede cambiar desde anulada
    };

    const siguienteEstado = secuenciaEstados[policy.estado];
    
    if (!siguienteEstado) {
      throw new BadRequestException(`No se puede cambiar el estado desde ${policy.estado}. La póliza ya está anulada.`);
    }

    policy.estado = siguienteEstado as 'emitida' | 'activa' | 'anulada';
    return policy;
  }

  update(id: string, updatePolizaDto: UpdatePolizaDto): Policy {
    const policy = this.findOne(id);

    if (updatePolizaDto.rutTitular)
      policy.rutTitular = updatePolizaDto.rutTitular;
    if (updatePolizaDto.planSalud) policy.planSalud = updatePolizaDto.planSalud;
    if (updatePolizaDto.prima !== undefined)
      policy.prima = updatePolizaDto.prima;

    return policy;
  }

  remove(id: string): void {
    const index = this.policies.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Policy con ID ${id} no encontrada`);
    }
    this.policies.splice(index, 1);
  }
}
