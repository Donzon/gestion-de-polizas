import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { CreatePolizaDto } from './dto/create-poliza.dto';
import { UpdatePolizaDto } from './dto/update-poliza.dto';

@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  // POST /policies - Crea una nueva póliza
  @Post()
  create(@Body() createPolizaDto: CreatePolizaDto) {
    return this.policiesService.create(createPolizaDto);
  }

  // GET /policies - Lista todas las pólizas (con filtro opcional por estado o fecha de emisión)
  @Get()
  findAll(
    @Query('estado') estado?: string,
    @Query('fechaEmision') fechaEmision?: string,
  ) {
    const filtros = { estado, fechaEmision };
    return this.policiesService.findAll(filtros);
  }

  // GET /policies/:id - Consulta una póliza específica por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.policiesService.findOne(id);
  }

  // PUT /policies/:id/status - Actualiza el estado de la póliza (emitida -> activa -> anulada)
  @Put(':id/status')
  updateStatus(@Param('id') id: string) {
    return this.policiesService.updateStatus(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePolizaDto: UpdatePolizaDto) {
    return this.policiesService.update(id, updatePolizaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.policiesService.remove(id);
  }
}
