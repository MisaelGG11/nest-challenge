import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto';

export class ArticleFilterOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Filter by author id' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number;
}

export class FilteredArticlePagination extends IntersectionType(
  ArticleFilterOptionsDto,
  PaginationOptionsDto,
) {}
