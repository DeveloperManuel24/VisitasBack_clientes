import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { VisitasService } from './visitas.service'
import { CreateVisitaDto } from './dto/create-visita.dto'
import { UpdateVisitaDto } from './dto/update-visita.dto'
import { QueryVisitaDto } from './dto/query-visita.dto'
import { CheckInDto } from './dto/check-in.dto'
import { CheckOutDto } from './dto/check-out.dto'
import { CreateEvidenciaDto } from './dto/create-evidencia.dto'
import { QueryVisitaTecnicoDto } from './dto/query-visita-tecnico.dto'

@Controller('visitas')
export class VisitasController {
  constructor(private readonly service: VisitasService) {}

  // Crear visita nueva
  @Post()
  create(@Body() dto: CreateVisitaDto) {
    return this.service.create(dto)
  }

  // Listar TODAS las visitas (admin / supervisor)
  // Permite filtros como q, estado, clienteId, tecnicoId, fechas, etc.
  @Get()
  findAll(@Query() query: QueryVisitaDto) {
    return this.service.findAll(query)
  }

  // 🔥 NUEVO:
  // Listar SOLO las visitas asignadas a un técnico específico
  // GET /visitas/tecnico/:tecnicoId?from=2025-10-01&to=2025-10-31
  @Get('tecnico/:tecnicoId')
  findByTecnico(
    @Param('tecnicoId') tecnicoId: string,
    @Query() query: QueryVisitaTecnicoDto,
  ) {
    return this.service.findByTecnico(tecnicoId, query.from, query.to)
  }

  // Obtener una visita puntual con todo el detalle
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  // Actualizar datos de la visita (supervisorId, tecnicoId, horario, notas...)
  // OJO: esto NO marca check-in/out ni cancelar/completar
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVisitaDto) {
    return this.service.update(id, dto)
  }

  // Check-in del técnico en sitio
  @Post(':id/check-in')
  checkIn(@Param('id') id: string, @Body() dto: CheckInDto) {
    return this.service.checkIn(id, dto)
  }

  // Check-out del técnico (cierre de visita)
  @Post(':id/check-out')
  checkOut(@Param('id') id: string, @Body() dto: CheckOutDto) {
    return this.service.checkOut(id, dto)
  }

  // Cancelar visita (estado CANCELADA)
  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body('motivo') motivo?: string) {
    return this.service.cancel(id, motivo)
  }

  // Subir evidencia a una visita
  @Post(':id/evidencias')
  addEvidencia(@Param('id') id: string, @Body() dto: CreateEvidenciaDto) {
    return this.service.addEvidencia(id, dto)
  }

  // Soft delete
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
