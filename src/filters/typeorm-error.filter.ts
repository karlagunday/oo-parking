import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError, TypeORMError } from 'typeorm';

/**
 * Handles TypeOrm errors to respond with an appropriate code, message
 */
@Catch(TypeORMError)
export class TypeOrmErrorExceptionFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const errorMap: Record<string, { code: number; message: string }> = {
      EntityNotFoundError: {
        code: 404,
        message: 'Resource not found',
      },
    };

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const name = exception.name;
    const code = errorMap[name]?.code ?? 500;
    const message = errorMap[name]?.message ?? 'Something went wrong.';

    response.status(code).json({
      code,
      message,
    });
  }
}
