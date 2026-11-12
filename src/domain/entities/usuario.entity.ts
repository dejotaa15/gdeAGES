import { Cargo } from '../enums/cargo.enum';

export interface UsuarioProps {
  id?: string;
  nome: string | null;
  email: string;
  /** Sempre o hash, nunca a senha em texto puro. */
  senhaHash: string;
  cargo: Cargo;
  criadoEm?: Date;
}

export class Usuario {
  readonly id?: string;
  nome: string | null;
  email: string;
  senhaHash: string;
  cargo: Cargo;
  readonly criadoEm?: Date;

  constructor(props: UsuarioProps) {
    this.id = props.id;
    this.nome = props.nome;
    this.email = props.email.trim().toLowerCase();
    this.senhaHash = props.senhaHash;
    this.cargo = props.cargo;
    this.criadoEm = props.criadoEm;
  }
}
