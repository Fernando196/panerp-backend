import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion } from '../entitties/sesion.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(Sesion) private sesionRepo: Repository<Sesion>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const sesion = await this.sesionRepo.findOne({ where: { id: payload.sid } });
    if (!sesion || sesion.expiraAt < new Date()) {
      throw new UnauthorizedException('Sesión expirada');
    }
    return { id: payload.sub, rol: payload.rol, sessionId: payload.sid };
  }
}
