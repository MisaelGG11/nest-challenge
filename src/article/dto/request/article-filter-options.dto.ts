import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto';

export class ArticleFilterOptionsDto {
  @ApiPropertyOptional({ description: 'Search in title/content' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Filter by author id' })
  @IsOptional()
  @IsInt()
  @Min(1)
  authorId?: number;
}

export class FilteredArticlePagination extends IntersectionType(
  ArticleFilterOptionsDto,
  PaginationOptionsDto,
) {}
