/**
 * Interface Segregation: hash de senha e geração de token são contratos
 * separados — quem só precisa de um não é obrigado a depender do outro.
 */
export const HASH_SERVICE = Symbol('HASH_SERVICE');

export interface IHashService {
  gerar(texto: string): Promise<string>;
  comparar(texto: string, hash: string): Promise<boolean>;
}
