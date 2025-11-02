import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.adapterHost;
    const ctx = host.switchToHttp();

    // Default values
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let code: string | undefined;
    let details: any;

    // Nest HttpException -> usa su status y payload
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res) {
        const r = res as Record<string, any>;
        message = (r.message as string) ?? message;
        error = (r.error as string) ?? error;
        details = r.details ?? r;
      }
    }

    // Prisma known errors -> mapear a HTTP codes
    if (exception instanceof PrismaClientKnownRequestError) {
      code = exception.code;
      switch (exception.code) {
        case 'P2002': // unique constraint
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
          error = 'Conflict';
          break;
        case 'P2025': // not found
          status = HttpStatus.NOT_FOUND;
          message = 'Resource not found';
          error = 'Not Found';
          break;
        case 'P2003': // FK constraint
          status = HttpStatus.BAD_REQUEST;
          message = 'Related resource constraint failed';
          error = 'Bad Request';
          break;
        case 'P2000': // value too long
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid payload';
          error = 'Bad Request';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Database request failed';
          error = 'Bad Request';
          break;
      }
    }

    // Build uniform body
    const req = ctx.getRequest();
    const body = {
      statusCode: status,
      message,
      code, // prisma code or custom code (optional)
      path: req?.url,
      method: req?.method,
      requestId: req?.id, // Fastify request id
      timestamp: new Date().toISOString(),
      // Only include details in non-production
      ...(process.env.API_STAGE !== 'production' && details ? { details } : {}),
    };

    httpAdapter.reply(ctx.getResponse(), body, status);
  }
}
