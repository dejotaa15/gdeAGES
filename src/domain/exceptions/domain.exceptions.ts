/**
 * Exceções de domínio: descrevem o que deu errado na linguagem do negócio.
 * Elas não conhecem HTTP — quem traduz para status code é o
 * DomainExceptionFilter, na camada de Presentation.
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Recurso procurado não existe (vira 404). */
export class RecursoNaoEncontradoException extends DomainException {
  constructor(recurso: string, id: number | string) {
    super(`${recurso} ${id} não encontrado(a)`);
  }
}

/** Violação de uma regra de negócio (vira 422). */
export class RegraDeNegocioException extends DomainException {}

/** Tentativa de vender/retirar mais do que existe em estoque (vira 422). */
export class EstoqueInsuficienteException extends RegraDeNegocioException {
  constructor(produtoId: number, disponivel?: number, solicitado?: number) {
    const detalhe =
      disponivel !== undefined && solicitado !== undefined
        ? ` (disponível: ${disponivel}, solicitado: ${solicitado})`
        : '';
    super(`Estoque insuficiente para o produto ${produtoId}${detalhe}`);
  }
}

/** Recurso já existe / conflito de unicidade (vira 409). */
export class ConflitoException extends DomainException {}

/** E-mail ou senha incorretos (vira 401). */
export class CredenciaisInvalidasException extends DomainException {
  constructor() {
    super('E-mail ou senha inválidos');
  }
}
