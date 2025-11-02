import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponse {
  @ApiProperty()
  error: string;

  @ApiProperty()
  statusCode: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiProperty()
  path: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  requestId: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  details: unknown;
}
