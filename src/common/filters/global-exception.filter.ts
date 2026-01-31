import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as path from 'path';
import { AppException } from '../exceptions/app.exceptions';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const env = process.env.NODE_ENV || 'development';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong on our side.';
    let status: 'fail' | 'error' = 'error';
    let isOperational = false;
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
      // status =
      //     `${statusCode}`.startsWith('4') ? 'fail' : 'error';

      status =
        exception instanceof AppException
          ? exception.errorStatus
          : `${statusCode}`.startsWith('4')
            ? 'fail'
            : 'error';
      isOperational = true;
      stack = exception.stack;
    }

    // Extract filename from stack trace
    let fileName = 'unknown';
    if (exception instanceof Error && exception.stack) {
      const match = exception.stack.match(/\((.*):\d+:\d+\)/);
      if (match && match[1]) {
        fileName = path.relative(process.cwd(), match[1]);
      }
    }

    if (env === 'development') {
      console.error('💥 ERROR DETAILS:', exception);

      return response.status(statusCode).json({
        success: false,
        status,
        message,
        file: fileName,
        stack,
        error: exception,
      });
    }

    // Production – operational errors
    if (isOperational) {
      return response.status(statusCode).json({
        success: false,
        status,
        message,
        file: fileName,
      });
    }

    // Unknown / programming errors
    console.error('💥 UNEXPECTED ERROR:', exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: 'error',
      message: 'Something went wrong on our side.',
      file: fileName,
    });
  }
}
