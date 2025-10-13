import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { VisitasService } from './visitas.service';
import { CreateVisitaDto } from './dto/create-visita.dto';
import { UpdateVisitaDto } from './dto/update-visita.dto';
import { QueryVisitaDto } from './dto/query-visita.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';

@Controller('visitas')
export class VisitasController {
  constructor(private readonly service: VisitasService) {}

  @Post()
  create(@Body() dto: CreateVisitaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryVisitaDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVisitaDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/check-in')
  checkIn(@Param('id') id: string, @Body() dto: CheckInDto) {
    return this.service.checkIn(id, dto);
  }

  @Post(':id/check-out')
  checkOut(@Param('id') id: string, @Body() dto: CheckOutDto) {
    return this.service.checkOut(id, dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body('motivo') motivo?: string) {
    return this.service.cancel(id, motivo);
  }

  @Post(':id/evidencias')
  addEvidencia(@Param('id') id: string, @Body() dto: CreateEvidenciaDto) {
    return this.service.addEvidencia(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
