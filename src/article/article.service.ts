import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../database/prisma.service';
import { CreateArticleDto } from './dto/request/create-article.dto';
import { UpdateArticleDto } from './dto/request/update-article.dto';
import { ArticleFilterOptionsDto } from './dto/request/article-filter-options.dto';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';
import { ArticleDto } from './dto/response/article.dto';
import { calculatePagination } from '../common/utils/calculate-pagination';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';
import { ResultPagination } from 'src/common/interfaces/result-pagination.interface';

type Range = { from: number; to: number };

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateArticleDto, authorId: number): Promise<ArticleDto> {
    // Ensure author exists and is active
    const author = await this.prisma.user.findFirst({
      where: { id: authorId, deletedAt: null },
      select: { id: true },
    });
    if (!author) throw new NotFoundException('Author not found');

    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorId,
      },
      include: {
        author: { select: { id: true, email: true, name: true } },
      },
    });

    return plainToInstance(ArticleDto, article);
  }

  async findAll(
    filters: ArticleFilterOptionsDto,
    paginationOptions: PaginationOptionsDto,
  ): Promise<PaginatedResultDto<ArticleDto> | ArticleDto[]> {
    const page = Math.max(1, Number(paginationOptions?.page ?? 1));
    const perPage = Math.max(
      1,
      Math.min(Number(paginationOptions?.perPage), 100),
    );

    // Add filters
    const where: Record<string, any> = { deletedAt: null };

    if (filters.title) {
      where.title = { contains: filters.title, mode: 'insensitive' };
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    if (!paginationOptions.paginate) {
      const rows = await this.prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, email: true, name: true } },
        },
      });
      return plainToInstance(ArticleDto, rows);
    }

    const [rows, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, email: true, name: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    let resultPagination: ResultPagination;
    try {
      resultPagination = calculatePagination(paginationOptions, total);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const { from, to } = resultPagination;

    return plainToInstance(PaginatedResultDto<ArticleDto>, {
      data: plainToInstance(ArticleDto, rows),
      pagination: {
        from: total === 0 ? from : from + 1,
        to,
        page,
        perPage,
        total,
      },
    });
  }

  async findOne(id: number): Promise<ArticleDto> {
    const article = await this.prisma.article.findFirst({
      where: { id, deletedAt: null },
      include: {
        author: { select: { id: true, email: true, name: true } },
      },
    });
    if (!article) throw new NotFoundException('Article not found');
    return plainToInstance(ArticleDto, article);
  }

  async update(
    articleId: number,
    UpdateArticleDto: UpdateArticleDto,
    userId: number,
  ): Promise<ArticleDto> {
    // Ensure article exists and belongs to requester (if aplicable)
    const existing = await this.prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { id: true, authorId: true },
    });
    if (!existing) throw new NotFoundException('Article not found');

    // Optional ownership check;
    if (existing.authorId !== userId) {
      throw new ForbiddenException('Article does not belong to user');
    }

    try {
      const { title, content } = UpdateArticleDto;

      const data: Record<string, unknown> = {};
      if (title !== undefined) data.title = title;
      if (content !== undefined) data.content = content;

      const article = await this.prisma.article.update({
        where: { id: articleId },
        data,
        include: {
          author: { select: { id: true, email: true, name: true } },
        },
      });

      return plainToInstance(ArticleDto, article);
    } catch (error: any) {
      this.logger.error('Error updating article', error?.stack ?? undefined);
      throw error;
    }
  }

  async remove(articleId: number, userId: number): Promise<ArticleDto> {
    const existing = await this.prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { id: true, authorId: true },
    });
    if (!existing) throw new NotFoundException('Article not found');

    if (existing.authorId !== userId) {
      throw new ForbiddenException('Article does not belong to user');
    }

    const article = await this.prisma.article.update({
      where: { id: articleId },
      data: { deletedAt: new Date() },
      include: {
        author: { select: { id: true, email: true, name: true } },
      },
    });

    return plainToInstance(ArticleDto, article);
  }
}
