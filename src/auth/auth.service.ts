import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/request/login.dto';
import { CreateUserDto } from '../user/dto/request/create-user.dto';
import { RefreshTokenDto } from './dto/request/refresh-token.dto';
import { TokenResponseDto } from './dto/response/token-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  private readonly secret: string;
  private readonly accessExpiresIn: number;
  private readonly refreshExpiresIn: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    cfg: ConfigService,
  ) {
    this.secret = cfg.get<string>('JWT_SECRET')!;
    this.accessExpiresIn = cfg.get('JWT_EXPIRES_IN')!;
    this.refreshExpiresIn = cfg.get('JWT_REFRESH_EXPIRES_IN')!;
  }

  private async issueTokens(
    user: { id: number; email: string },
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<TokenResponseDto> {
    console.log({
      expiresInAccess: this.accessExpiresIn,
      expiresInRefresh: this.refreshExpiresIn,
    });
    // Access token
    const token = this.jwt.sign<{ sub: number; email: string }>(
      { sub: user.id, email: user.email },
      { secret: this.secret, expiresIn: `${this.accessExpiresIn}s` },
    );

    const decodedAccess = this.jwt.decode(token);

    // Refresh token with jti to identify  at the time of revocation
    const jti = randomUUID();
    const refreshToken = this.jwt.sign<{ sub: number; jti: string }>(
      { sub: user.id, jti },
      { secret: this.secret, expiresIn: `${this.refreshExpiresIn}s` },
    );
    const decodedRefresh = this.jwt.decode(refreshToken);

    // Persistir hash de refresh
    const tokenHash = await bcrypt.hash(refreshToken, 12);
    await this.prisma.refreshToken.create({
      data: {
        jti,
        tokenHash,
        userId: user.id,
        expiresAt: new Date(decodedRefresh.exp * 1000),
        ip: ctx?.ip,
        userAgent: ctx?.userAgent,
      },
    });

    return plainToInstance(TokenResponseDto, {
      token,
      tokenType: 'bearer',
      expiresIn: decodedAccess.exp,
      refreshToken,
    });
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: number; email: string } | null> {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
    if (!user) return null;

    // If user found, verify password
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) return null;

    return { id: user.id, email: user.email };
  }

  async login(
    loginDto: LoginDto,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<TokenResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user, ctx);
  }

  async register(
    createUserDto: CreateUserDto,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<TokenResponseDto> {
    const email = createUserDto.email.toLowerCase();

    const existing = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = bcrypt.hashSync(createUserDto.password, 15);

    const userCreated = await this.prisma.user.create({
      data: { email, password: hashed, name: createUserDto.name ?? null },
      select: { id: true, email: true },
    });

    return this.issueTokens(userCreated, ctx);
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
    ctx?: { ip?: string; userAgent?: string },
  ): Promise<TokenResponseDto> {
    let payload: { sub: number; jti: string; exp: number };

    try {
      payload = await this.jwt.verifyAsync(refreshTokenDto.refreshToken, {
        secret: this.secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Retrieve stored token and validate it
    const stored = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
    });
    if (!stored || stored.revokedAt)
      throw new UnauthorizedException('Refresh token revoked');

    if (stored.expiresAt.getTime() <= Date.now())
      throw new UnauthorizedException('Refresh token expired');

    const match = await bcrypt.compare(
      refreshTokenDto.refreshToken,
      stored.tokenHash,
    );
    if (!match) throw new UnauthorizedException('Invalid refresh token');

    // Revoke used refresh token
    await this.prisma.refreshToken.update({
      where: { jti: payload.jti },
      data: { revokedAt: new Date() },
    });

    // Emite new tokens
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, email: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return this.issueTokens(user, ctx);
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<void> {
    try {
      const payload = await this.jwt.verifyAsync<{ jti: string }>(
        refreshTokenDto.refreshToken,
        {
          secret: this.secret,
        },
      );
      await this.prisma.refreshToken.updateMany({
        where: { jti: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Invalid/expired token
    }
  }
}
