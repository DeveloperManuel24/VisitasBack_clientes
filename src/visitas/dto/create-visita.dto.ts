import { IsNotEmpty, IsOptional, IsString, Length, IsEnum, IsDateString } from 'class-validator';
import { VisitaEstado } from '../enums/visita.enums';

export class CreateVisitaDto {
  @IsString() @Length(1, 50)
  clienteId!: string;

  @IsOptional() @IsString() @Length(0, 50)
  supervisorId?: string | null;

  @IsOptional() @IsString() @Length(0, 50)
  tecnicoId?: string | null;

  @IsDateString()
  scheduledAt!: string; // ISO

  @IsOptional() @IsString() @Length(0, 1000)
  notaSupervisor?: string;

  // opcionalmente permitir estado inicial (por default PENDIENTE)
  @IsOptional() @IsEnum(VisitaEstado)
  estado?: VisitaEstado;
}
