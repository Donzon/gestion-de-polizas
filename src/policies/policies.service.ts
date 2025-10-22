import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreatePolizaDto } from './dto/create-poliza.dto';
import { UpdatePolizaDto } from './dto/update-poliza.dto';
import { Policy } from './entities/policy.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);
  private readonly policies: Policy[] = [];

  create(createPolizaDto: CreatePolizaDto): Policy {
    this.logger.log(`Creando nueva policy para RUT: ${createPolizaDto.rutTitular}`);
    
    const nuevaPolicy: Policy = {
      id: uuidv4(),
      rutTitular: createPolizaDto.rutTitular,
      fechaEmision: new Date(),
      planSalud: createPolizaDto.planSalud,
      prima: createPolizaDto.prima,
      estado: 'emitida',
    };

    this.policies.push(nuevaPolicy);
    this.logger.log(`Policy creada exitosamente con ID: ${nuevaPolicy.id}`);
    return nuevaPolicy;
  }

  findAll(filtros?: { estado?: string; fechaEmision?: string }): Policy[] {
    this.logger.log(`Buscando policies${filtros ? ` con filtros: ${JSON.stringify(filtros)}` : ''}`);
    
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

    this.logger.log(`Se encontraron ${resultado.length} policies`);
    return resultado;
  }

  findOne(id: string): Policy {
    this.logger.log(`Buscando policy con ID: ${id}`);
    
    const policy = this.policies.find((p) => p.id === id);
    if (!policy) {
      this.logger.warn(`Policy con ID ${id} no encontrada`);
      throw new NotFoundException(`Policy con ID ${id} no encontrada`);
    }
    
    this.logger.log(`Policy encontrada: ${policy.rutTitular} - Estado: ${policy.estado}`);
    return policy;
  }

  updateStatus(id: string): Policy {
    this.logger.log(`Actualizando estado de policy con ID: ${id}`);
    
    const policy = this.findOne(id);
    
    // Definir la secuencia de estados: emitida -> activa -> anulada
    const secuenciaEstados: Record<string, string | null> = {
      'emitida': 'activa',
      'activa': 'anulada',
      'anulada': null // No se puede cambiar desde anulada
    };

    const siguienteEstado = secuenciaEstados[policy.estado];
    
    if (!siguienteEstado) {
      this.logger.error(`No se puede cambiar el estado desde ${policy.estado}. La policy ya está anulada.`);
      throw new BadRequestException(`No se puede cambiar el estado desde ${policy.estado}. La póliza ya está anulada.`);
    }

    const estadoAnterior = policy.estado;
    policy.estado = siguienteEstado as 'emitida' | 'activa' | 'anulada';
    
    this.logger.log(`Estado actualizado: ${estadoAnterior} -> ${policy.estado} para policy ${policy.rutTitular}`);
    return policy;
  }

  update(id: string, updatePolizaDto: UpdatePolizaDto): Policy {
    this.logger.log(`Actualizando policy con ID: ${id}`);
    
    const policy = this.findOne(id);

    if (updatePolizaDto.rutTitular) {
      this.logger.log(`Actualizando RUT: ${policy.rutTitular} -> ${updatePolizaDto.rutTitular}`);
      policy.rutTitular = updatePolizaDto.rutTitular;
    }
    if (updatePolizaDto.planSalud) {
      this.logger.log(`Actualizando plan: ${policy.planSalud} -> ${updatePolizaDto.planSalud}`);
      policy.planSalud = updatePolizaDto.planSalud;
    }
    if (updatePolizaDto.prima !== undefined) {
      this.logger.log(`Actualizando prima: ${policy.prima} -> ${updatePolizaDto.prima}`);
      policy.prima = updatePolizaDto.prima;
    }

    this.logger.log(`Policy actualizada exitosamente para ${policy.rutTitular}`);
    return policy;
  }

  remove(id: string): void {
    this.logger.log(`Eliminando policy con ID: ${id}`);
    
    const index = this.policies.findIndex((p) => p.id === id);
    if (index === -1) {
      this.logger.warn(`Policy con ID ${id} no encontrada para eliminar`);
      throw new NotFoundException(`Policy con ID ${id} no encontrada`);
    }
    
    const policyEliminada = this.policies[index];
    this.policies.splice(index, 1);
    this.logger.log(`Policy eliminada exitosamente: ${policyEliminada.rutTitular} (ID: ${id})`);
  }
}
