import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsInt()
  @Min(1)
  authorId!: number;
}
