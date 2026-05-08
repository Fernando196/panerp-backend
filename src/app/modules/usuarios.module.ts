import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosController } from '../controllers/usuarios.controller';
import { UsuariosService } from '../services/usuarios.service';
import { Usuario } from '../../domain/entitites/usuario.entity';
import { Rol } from '../../domain/entitites/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Rol])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
