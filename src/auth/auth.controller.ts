import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/request/login.dto';
import { CreateUserDto } from '../user/dto/request/create-user.dto';
import { RefreshTokenDto } from './dto/request/refresh-token.dto';
import { ApiErrorResponses } from 'src/common/decorators/api-error-responses.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@ApiErrorResponses([HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR])
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiErrorResponses([HttpStatus.CONFLICT])
  async register(@Body() dto: CreateUserDto, @Request() req: FastifyRequest) {
    return this.auth.register(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiErrorResponses([HttpStatus.UNAUTHORIZED])
  async login(@Body() loginDto: LoginDto, @Request() req: FastifyRequest) {
    return this.auth.login(loginDto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiErrorResponses([HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND])
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Request() req: FastifyRequest,
  ) {
    return this.auth.refresh(refreshTokenDto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.auth.logout(refreshTokenDto);
  }
}
