import {
  Injectable, UnauthorizedException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { Usuario } from '../../domain/entitites/usuario.entity';
import { Sesion } from './entities/sesion.entity';
import { LoginDto } from '../../domain/dto/login.dto';
import { ResetPasswordDto } from '../../domain/dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Sesion)  private sesionRepo: Repository<Sesion>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: { email: dto.email, activo: true },
      relations: ['rol'],
    });
    if (!usuario) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(dto.password, usuario.password_hash);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    const sessionId = uuid();
    const payload = { sub: usuario.id, rol: usuario.rol.nombre, sid: sessionId };
    const token = this.jwtService.sign(payload);

    await this.sesionRepo.save({
      id: sessionId,
      usuario_id: usuario.id,
      token_hash: await bcrypt.hash(token, 8),
      expira_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre,
      },
    };
  }

  async logout(sessionId: string) {
    await this.sesionRepo.delete({ id: sessionId });
    return { message: 'Sesión cerrada correctamente' };
  }

  async me(usuarioId: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: usuarioId },
      relations: ['rol'],
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    const { password_hash, ...rest } = usuario;
    return rest;
  }

  async recuperarPassword(email: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { email } });
    if (!usuario) return { message: 'Si el correo existe, recibirás instrucciones' };
    // TODO: generar token temporal y enviar email
    return { message: 'Si el correo existe, recibirás instrucciones' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // TODO: validar token temporal y actualizar password
    throw new BadRequestException('Token inválido o expirado');
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const newToken = this.jwtService.sign({
        sub: payload.sub,
        rol: payload.rol,
        sid: payload.sid,
      });
      return { token: newToken };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
