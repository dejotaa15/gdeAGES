import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UsuarioResponseDto } from './usuario.dto';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  senha: string;
}

export class LoginResponseDto {
  accessToken: string;
  tokenType: 'Bearer';
  usuario: UsuarioResponseDto;
}
