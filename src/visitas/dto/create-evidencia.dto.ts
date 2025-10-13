import { IsEnum, IsOptional, IsString, Length, IsUrl } from 'class-validator';
import { EvidenciaTipo } from '../enums/visita.enums';

export class CreateEvidenciaDto {
  @IsEnum(EvidenciaTipo)
  tipo!: EvidenciaTipo;

  @IsUrl()
  url!: string;

  @IsOptional() @IsString() @Length(0, 500)
  descripcion?: string;
}
