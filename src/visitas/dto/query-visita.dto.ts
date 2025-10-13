import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { VisitaEstado } from '../enums/visita.enums';

export class QueryVisitaDto {
  @IsOptional() @IsString() q?: string; // para buscar por nombre de cliente (join) o notas

  @IsOptional() @IsEnum(VisitaEstado) estado?: VisitaEstado;

  @IsOptional() @IsString() tecnicoId?: string;

  @IsOptional() @IsString() supervisorId?: string;

  @IsOptional() @IsString() clienteId?: string;

  @IsOptional() @IsDateString() from?: string; // rango de scheduledAt
  @IsOptional() @IsDateString() to?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit: number = 10;
}
