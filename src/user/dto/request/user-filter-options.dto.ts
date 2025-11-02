import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto';

export class UserFilterOptionsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  email?: string;
}

export class FilteredUserPagination extends IntersectionType(
  UserFilterOptionsDto,
  PaginationOptionsDto,
) {}
