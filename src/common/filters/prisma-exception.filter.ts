import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

type ErrorResponse = {
  statusCode: number;
  message: string;
};

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const error = this.mapException(exception);

    if (error.statusCode === 500) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(error.statusCode).json(error);
  }

  private mapException(exception: Error): ErrorResponse {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'Registro duplicado',
          };
        case 'P2003':
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Relacionamento inválido',
          };
        case 'P2025':
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Registro não encontrado',
          };
        default:
          return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Erro ao acessar o banco de dados',
          };
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Dados inválidos para persistência',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro ao acessar o banco de dados',
    };
  }
}
