import { ApiHideProperty } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';

export class PaginatedResultDto<T> {
  @ApiHideProperty()
  data: T[];

  pagination: PaginationDto;
}
