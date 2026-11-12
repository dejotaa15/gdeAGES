import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ConflitoException,
  CredenciaisInvalidasException,
  DomainException,
  RecursoNaoEncontradoException,
  RegraDeNegocioException,
} from '../../domain/exceptions/domain.exceptions';

/**
 * Traduz exceções de domínio para HTTP. Open/Closed: para uma exceção
 * nova, basta adicionar uma linha na tabela — o resto não muda.
 */
const STATUS_POR_EXCECAO: [new (...args: any[]) => DomainException, number][] =
  [
    [RecursoNaoEncontradoException, HttpStatus.NOT_FOUND],
    [ConflitoException, HttpStatus.CONFLICT],
    [CredenciaisInvalidasException, HttpStatus.UNAUTHORIZED],
    [RegraDeNegocioException, HttpStatus.UNPROCESSABLE_ENTITY],
  ];

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      STATUS_POR_EXCECAO.find(([tipo]) => exception instanceof tipo)?.[1] ??
      HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
