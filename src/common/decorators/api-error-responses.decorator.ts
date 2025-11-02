import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { ValidationErrorResponse } from '../dto/validation-error-response.dto';

interface ErrorResponse {
  status: HttpStatus;
  description: string;
  example: object;
}

const commonProps = {
  path: '/path/to/resource',
  method: 'POST',
  requestId: 'unique-request-id',
  timestamp: new Date().toISOString(),
};

const errorResponses: ErrorResponse[] = [
  {
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
    example: {
      error: 'Bad Request',
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid data',
      ...commonProps,
    },
  },
  {
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    example: {
      error: 'Unauthorized',
      statusCode: HttpStatus.UNAUTHORIZED,
      ...commonProps,
    },
  },
  {
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden',
    example: {
      error: 'Forbidden',
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Forbidden resource',
      ...commonProps,
    },
  },
  {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
    example: {
      error: 'Internal Server Error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      ...commonProps,
    },
  },
  {
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found',
    example: {
      error: 'Not Found',
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Resource not found',
      ...commonProps,
    },
  },
  {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Unprocessable Entity',
    example: {
      error: 'Unprocessable Entity',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Invalid data',
      ...commonProps,
    },
  },
  {
    status: HttpStatus.CONFLICT,
    description: 'Conflict',
    example: {
      error: 'Conflict',
      statusCode: HttpStatus.CONFLICT,
      message: 'Resource conflict',
      ...commonProps,
    },
  },
];

export function ApiErrorResponses(statuses: HttpStatus[] = []) {
  const responses = statuses.length
    ? errorResponses.filter((response) => statuses.includes(response.status))
    : errorResponses;

  return applyDecorators(
    ...responses.map((response) =>
      ApiResponse({
        status: response.status,
        description: response.description,
        type: ValidationErrorResponse,
        example: response.example,
      }),
    ),
  );
}
