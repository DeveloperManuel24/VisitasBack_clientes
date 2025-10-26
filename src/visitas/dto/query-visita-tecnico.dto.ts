import { IsOptional, IsString, IsDateString } from 'class-validator'

export class QueryVisitaTecnicoDto {
  @IsString()
  tecnicoId: string // requerido en la ruta, pero lo dejamos aquí por consistencia si quisieras moverlo a query

  @IsOptional()
  @IsDateString()
  from?: string

  @IsOptional()
  @IsDateString()
  to?: string
}
