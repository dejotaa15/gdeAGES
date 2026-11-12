import { Cargo } from '../../../domain/enums/cargo.enum';
import {
  ConflitoException,
  CredenciaisInvalidasException,
} from '../../../domain/exceptions/domain.exceptions';
import {
  FakeHashService,
  FakeTokenService,
  InMemoryUsuarioRepository,
} from '../../__fakes__/in-memory.repositories';
import { UsuarioService } from '../../services/usuario.service';
import { CriarUsuarioUseCase } from '../usuarios/criar-usuario.use-case';
import { LoginUseCase } from './login.use-case';

describe('Usuários e Login', () => {
  let usuarios: InMemoryUsuarioRepository;
  let criar: CriarUsuarioUseCase;
  let login: LoginUseCase;

  beforeEach(() => {
    usuarios = new InMemoryUsuarioRepository();
    const service = new UsuarioService(usuarios);
    const hash = new FakeHashService();
    criar = new CriarUsuarioUseCase(service, hash);
    login = new LoginUseCase(service, hash, new FakeTokenService());
  });

  it('salva o hash, nunca a senha em texto puro', async () => {
    const usuario = await criar.executar({
      nome: 'Ana',
      email: 'Ana@Panvel.com',
      senha: 'segredo123',
    });
    expect(usuario.senhaHash).not.toBe('segredo123');
    expect(usuario.email).toBe('ana@panvel.com');
    expect(usuario.cargo).toBe(Cargo.ATENDENTE);
  });

  it('não deixa cadastrar e-mail repetido', async () => {
    await criar.executar({ nome: 'A', email: 'a@a.com', senha: '123456' });
    await expect(
      criar.executar({ nome: 'B', email: 'A@a.com', senha: '123456' }),
    ).rejects.toThrow(ConflitoException);
  });

  it('gera token com o cargo do usuário no login', async () => {
    await criar.executar({
      nome: 'Gê',
      email: 'g@panvel.com',
      senha: 'gerente1',
      cargo: Cargo.GERENTE,
    });

    const resposta = await login.executar({
      email: 'g@panvel.com',
      senha: 'gerente1',
    });

    expect(resposta.accessToken).toContain(Cargo.GERENTE);
    expect(resposta.usuario).not.toHaveProperty('senhaHash');
  });

  it('dá o mesmo erro para senha errada e e-mail inexistente', async () => {
    await criar.executar({ nome: 'A', email: 'a@a.com', senha: '123456' });

    await expect(
      login.executar({ email: 'a@a.com', senha: 'errada' }),
    ).rejects.toThrow(CredenciaisInvalidasException);
    await expect(
      login.executar({ email: 'naoexiste@a.com', senha: '123456' }),
    ).rejects.toThrow(CredenciaisInvalidasException);
  });
});
