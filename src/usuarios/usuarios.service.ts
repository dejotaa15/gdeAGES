import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  private usuarios: Usuario[] = [];

  create(createUsuarioDto: CreateUsuarioDto) {
    const novoUsuario: Usuario = {
      id: Date.now(),
      ...createUsuarioDto,
    };

    this.usuarios.push(novoUsuario);

    return novoUsuario;
  }

  findAll() {
    return this.usuarios;
  }

  findOne(id: number) {
    return this.usuarios.find((usuario) => usuario.id === id);
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const index = this.usuarios.findIndex((usuario) => usuario.id === id);

    if (index === -1) {
      return null;
    }

    this.usuarios[index] = {
      ...this.usuarios[index],
      ...updateUsuarioDto,
    };

    return this.usuarios[index];
  }

  remove(id: number) {
    const usuarioExiste = this.usuarios.some((usuario) => usuario.id === id);

    if (!usuarioExiste) {
      return null;
    }

    this.usuarios = this.usuarios.filter((usuario) => usuario.id !== id);

    return { removido: true };
  }
}