import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import {
  FilteredUserPagination,
  UserFilterOptionsDto,
} from './dto/request/user-filter-options.dto';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';
import { filterPaginationProperties } from 'src/common/utils/filter-pagination-properties';
import { UserDto } from './dto/response/user.dto';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { PaginatedResultDto } from 'src/common/dto/paginated-result.dto';

@ApiTags('users')
@ApiErrorResponses([
  HttpStatus.BAD_REQUEST,
  HttpStatus.UNAUTHORIZED,
  HttpStatus.INTERNAL_SERVER_ERROR,
])
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Creating user ${createUserDto.email}`);
    return this.userService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiPaginatedResponse(UserDto)
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  async findAll(
    @Query() filteredPagination: FilteredUserPagination,
  ): Promise<PaginatedResultDto<UserDto>> {
    const { pagination, filter } =
      filterPaginationProperties<UserFilterOptionsDto>(filteredPagination);
    return this.userService.findAll(filter, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by id' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by id' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return await this.userService.remove(id);
  }
}
