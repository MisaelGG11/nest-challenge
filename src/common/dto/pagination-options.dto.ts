import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class PaginationOptionsDto {
  @ApiPropertyOptional({ type: Number })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  @IsPositive()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ type: Number })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Max(25)
  perPage: number = 5;

  @ApiPropertyOptional({ type: Boolean })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  paginate: boolean = true;
}
