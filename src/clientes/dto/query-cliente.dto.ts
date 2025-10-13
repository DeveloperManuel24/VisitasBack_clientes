import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional, IsString, Max } from 'class-validator';

export class QueryClienteDto {
  @IsOptional() @IsString()
  q?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit: number = 10;
}
