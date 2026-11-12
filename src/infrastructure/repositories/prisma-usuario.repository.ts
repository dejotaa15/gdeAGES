import { Injectable } from '@nestjs/common';
import { Usuario } from '../../domain/entities/usuario.entity';
import { IUsuarioRepository } from '../../application/interfaces/usuario.repository';
import { PrismaService } from '../database/prisma.service';
import { UsuarioPrismaMapper } from '../database/prisma.mappers';

@Injectable()
export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async criar(usuario: Usuario): Promise<Usuario> {
    const criado = await this.prisma.user.create({
      data: {
        name: usuario.nome,
        email: usuario.email,
        senha: usuario.senhaHash,
        cargo: usuario.cargo,
      },
    });
    return UsuarioPrismaMapper.toDomain(criado);
  }

  async listar(): Promise<Usuario[]> {
    const usuarios = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return usuarios.map(UsuarioPrismaMapper.toDomain);
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const usuario = await this.prisma.user.findUnique({ where: { id } });
    return usuario ? UsuarioPrismaMapper.toDomain(usuario) : null;
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const usuario = await this.prisma.user.findUnique({ where: { email } });
    return usuario ? UsuarioPrismaMapper.toDomain(usuario) : null;
  }

  async salvar(usuario: Usuario): Promise<Usuario> {
    const salvo = await this.prisma.user.update({
      where: { id: usuario.id },
      data: {
        name: usuario.nome,
        email: usuario.email,
        senha: usuario.senhaHash,
        cargo: usuario.cargo,
      },
    });
    return UsuarioPrismaMapper.toDomain(salvo);
  }

  async remover(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
