import { PartialType } from '@nestjs/mapped-types';
import { CreateVisitaDto } from './create-visita.dto';
import { IsEnum, IsOptional, IsString, Length, IsDateString } from 'class-validator';
import { VisitaEstado } from '../enums/visita.enums';

export class UpdateVisitaDto extends PartialType(CreateVisitaDto) {
  @IsOptional() @IsEnum(VisitaEstado)
  estado?: VisitaEstado;

  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @IsOptional() @IsString() @Length(0, 1000)
  notaTecnico?: string;
}
