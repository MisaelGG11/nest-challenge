import { IsString, IsIn, IsInt, Min } from 'class-validator';

export class TokenResponseDto {
  @IsString()
  token!: string;

  @IsString()
  @IsIn(['bearer'])
  tokenType!: 'bearer';

  @IsInt()
  @Min(0)
  expiresIn!: number; // epoch seconds (exp)

  @IsString()
  refreshToken!: string;
}
