import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError, TypeORMError } from 'typeorm';

/**
 * Handles TypeOrm errors to respond with an appropriate code, message
 */
@Catch(TypeORMError)
export class TypeOrmErrorExceptionFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const errorMap: Record<
      string,
      { code: number; message: string; error: string }
    > = {
      EntityNotFoundError: {
        code: 404,
        message: 'Resource not found',
        error: 'Not Found',
      },
    };

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const name = exception.name;
    const statusCode = errorMap[name]?.code ?? 500;
    const message = errorMap[name]?.message ?? 'Something went wrong.';
    const error = errorMap[name]?.message ?? 'Internal server error';
    console.log('An error has occurred. Details: ', exception);

    response.status(statusCode).json({
      statusCode,
      message,
      error,
    });
  }
}
