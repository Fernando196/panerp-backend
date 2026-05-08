import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { ZodValidationException } from 'nestjs-zod'
import { ZodError } from 'zod'

interface ErrorResponse {
  statusCode: number
  message: string
  errors?: Record<string, string[]>
  timestamp: string
  path: string
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const errorResponse = this.buildErrorResponse(exception, request.url)

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${errorResponse.statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      )
    } else {
      this.logger.warn(
        `${request.method} ${request.url} → ${errorResponse.statusCode}: ${errorResponse.message}`,
      )
    }

    response.status(errorResponse.statusCode).json(errorResponse)
  }

  private buildErrorResponse(exception: unknown, path: string): ErrorResponse {
    const timestamp = new Date().toISOString()

    // Errores de validación Zod
    if (exception instanceof ZodValidationException) {
      const zodErrors = exception.getZodError() as ZodError
      const errors: Record<string, string[]> = {}
      for (const issue of zodErrors.issues) {
        const field = issue.path.join('.')
        if (!errors[field]) errors[field] = []
        errors[field]!.push(issue.message)
      }
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Error de validación',
        errors,
        timestamp,
        path,
      }
    }

    // Excepciones HTTP de NestJS
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const exceptionResponse = exception.getResponse()
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string }).message ?? exception.message

      return { statusCode: status, message, timestamp, path }
    }

    // Error desconocido — no exponer detalles al cliente
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
      timestamp,
      path,
    }
  }
}
