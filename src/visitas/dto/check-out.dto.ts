import { IsNumber, Max, Min, IsOptional, IsDateString, IsString, Length } from 'class-validator';

export class CheckOutDto {
  @IsOptional() @IsDateString()
  at?: string;

  @IsNumber({ maxDecimalPlaces: 6 }) @Min(-90) @Max(90)
  lat!: number;

  @IsNumber({ maxDecimalPlaces: 6 }) @Min(-180) @Max(180)
  lng!: number;

  @IsOptional() @IsString() @Length(0, 1000)
  notaTecnico?: string;
}
