import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaginationDto {
  @ApiProperty()
  @Expose()
  from: number;

  @ApiProperty()
  @Expose()
  to: number;

  @ApiProperty()
  @Expose()
  page: number;

  @ApiProperty()
  @Expose()
  perPage: number;

  @ApiProperty()
  @Expose()
  total: number;
}
