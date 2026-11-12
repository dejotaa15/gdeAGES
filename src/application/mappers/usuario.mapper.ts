import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioResponseDto } from '../dtos/usuario.dto';

export class UsuarioMapper {
  /** O hash da senha fica de fora de propósito. */
  static toResponse(usuario: Usuario): UsuarioResponseDto {
    return {
      id: usuario.id!,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      criadoEm: usuario.criadoEm,
    };
  }
}
