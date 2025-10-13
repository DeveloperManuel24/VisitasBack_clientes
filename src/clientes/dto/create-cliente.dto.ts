import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, IsNumber, Min, Max, ValidateIf, Validate } from 'class-validator';
import { Type } from 'class-transformer';

class LatLngPair {
  validate(dto: any) {
    const hasLat = dto.lat !== undefined && dto.lat !== null;
    const hasLng = dto.lng !== undefined && dto.lng !== null;
    return hasLat === hasLng; // ambos o ninguno
  }
  defaultMessage() { return 'Si envías lat debes enviar lng (y viceversa).'; }
}

export class CreateClienteDto {
  @IsString() @IsNotEmpty() @Length(2, 120)
  nombre!: string;

  @IsOptional() @IsString() @Length(0, 200)
  direccion?: string;

  @IsOptional() @IsString() @Length(0, 30)
  telefono?: string;

  @IsOptional() @IsEmail() @Length(0, 120)
  correo?: string;

  @Validate(LatLngPair)
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 6 }) @Min(-90) @Max(90)
  lat?: number;

  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 6 }) @Min(-180) @Max(180)
  lng?: number;

  @IsOptional() @IsString() @Length(0, 20)
  nit?: string;
}
