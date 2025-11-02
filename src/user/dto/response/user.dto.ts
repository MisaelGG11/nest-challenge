import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Exclude()
  @ApiHideProperty()
  password: string;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
