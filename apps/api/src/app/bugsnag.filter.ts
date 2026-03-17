import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import Bugsnag from '@bugsnag/node';
import type { Request, Response } from 'express';

@Catch()
export class BugsnagExceptionFilter implements ExceptionFilter {
  protected readonly logger = new Logger(BugsnagExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let body: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      body = exception.getResponse();
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      body = { statusCode: 500, message: 'Internal server error' };
    }

    if (status >= 500) {
      const error = exception instanceof Error ? exception : new Error(String(exception));

      this.logger.error(exception);

      if (Bugsnag.isStarted()) {
        Bugsnag.notify(error, (event) => {
          event.addMetadata('request', { method: request.method, url: request.url });
        });
      }
    }

    response.status(status).json(typeof body === 'object' ? body : { statusCode: status, message: body });
  }
}
