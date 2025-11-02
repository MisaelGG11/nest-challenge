import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto';
import { UserFilterOptionsDto } from './dto/request/user-filter-options.dto';
import { PrismaService } from '../database/prisma.service';
import { PaginatedResultDto } from 'src/common/dto/paginated-result.dto';
import { UserDto } from './dto/response/user.dto';
import { ResultPagination } from 'src/common/interfaces/result-pagination.interface';
import { plainToInstance } from 'class-transformer';
import { calculatePagination } from 'src/common/utils/calculate-pagination';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly DEFAULT_LIMIT = 20;

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const email = createUserDto.email.toLowerCase();

    // Verifica duplicado entre usuarios activos (deletedAt: null)
    const existing = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          email,
        },
      });

      return plainToInstance(UserDto, user);
    } catch (error: any) {
      this.logger.error('Error creating user', error?.stack ?? undefined);
      throw error;
    }
  }

  async findAll(
    filterOptions: UserFilterOptionsDto,
    paginationOptions: PaginationOptionsDto,
  ): Promise<PaginatedResultDto<UserDto>> {
    const page = Math.max(1, Number(paginationOptions?.page ?? 1));
    const perPage = Math.max(
      1,
      Math.min(Number(paginationOptions?.perPage ?? this.DEFAULT_LIMIT), 100),
    );

    const { email } = filterOptions ?? {};

    // Only fetch users that are not soft-deleted
    const where = {
      deletedAt: null,
      ...(email ? { email: { contains: email } } : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    let resultPagination: ResultPagination;
    try {
      resultPagination = calculatePagination(paginationOptions, total);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    const { from, to } = resultPagination;

    const paginatedResult = plainToInstance(PaginatedResultDto<UserDto>, {
      data: users,
      pagination: {
        from: total === 0 ? from : from + 1,
        to,
        page,
        perPage,
        total,
      },
    });

    return paginatedResult;
  }

  async findOne(id: number): Promise<UserDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToInstance(UserDto, user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    // Ensure the user is not soft-deleted
    const active = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!active) {
      throw new NotFoundException('User not found');
    }

    // Validate email uniqueness if it's being updated
    if (updateUserDto.email) {
      const email = updateUserDto.email.toLowerCase();
      const existing = await this.prisma.user.findFirst({
        where: { email, deletedAt: null, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('Email is already registered');
      }
    }

    try {
      const { email, name, password } = updateUserDto;

      const data: Record<string, unknown> = {};
      if (email !== undefined) data.email = email.toLowerCase();
      if (name !== undefined) data.name = name;
      if (password !== undefined) data.password = password;

      const user = await this.prisma.user.update({
        where: { id },
        data,
      });

      return plainToInstance(UserDto, user);
    } catch (error: any) {
      this.logger.error('Error updating user', error?.stack ?? undefined);
      throw error;
    }
  }

  // Soft delete
  async remove(id: number): Promise<UserDto> {
    // Solo permite soft delete de usuarios activos
    const existing = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return plainToInstance(UserDto, user);
    } catch (error: any) {
      this.logger.error('Error soft-deleting user', error?.stack ?? undefined);
      throw error;
    }
  }
}
