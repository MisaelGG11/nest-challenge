import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { UpdateArticleDto } from './dto/request/update-article.dto';
import {
  ArticleFilterOptionsDto,
  FilteredArticlePagination,
} from './dto/request/article-filter-options.dto';
import { filterPaginationProperties } from 'src/common/utils/filter-pagination-properties';
import { PaginatedResultDto } from 'src/common/dto/paginated-result.dto';
import { ArticleDto } from './dto/response/article.dto';

@ApiTags('articles')
@ApiBearerAuth()
@ApiErrorResponses([
  HttpStatus.BAD_REQUEST,
  HttpStatus.UNAUTHORIZED,
  HttpStatus.INTERNAL_SERVER_ERROR,
])
@UseGuards(JwtAuthGuard)
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create article for current user' })
  async create(
    @Body() dto: CreateArticleDto,
    @Request() req: FastifyRequest & { user: { userId: number } },
  ): Promise<ArticleDto> {
    return this.articleService.create(dto, req.user.userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List articles with filters and pagination' })
  async findAll(
    @Query() filteredPagination: FilteredArticlePagination,
  ): Promise<PaginatedResultDto<ArticleDto> | ArticleDto[]> {
    const { pagination, filter } =
      filterPaginationProperties<ArticleFilterOptionsDto>(filteredPagination);
    return this.articleService.findAll(filter, pagination);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single article by id' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ArticleDto> {
    return this.articleService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an article (owner only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateArticleDto,
    @Request() req: FastifyRequest & { user: { userId: number } },
  ): Promise<ArticleDto> {
    return this.articleService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete an article (owner only)' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: FastifyRequest & { user: { userId: number } },
  ): Promise<ArticleDto> {
    return this.articleService.remove(id, req.user.userId);
  }
}
