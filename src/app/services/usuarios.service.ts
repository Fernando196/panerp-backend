import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { Usuario, Rol } from '../../domain/entitites/usuario.entity';
import { CreateUsuarioDto } from '../../domain/dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../../domain/dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)     private rolRepo: Repository<Rol>,
  ) {}

  async findAll() {
    return this.usuarioRepo.find({
      where: { deleted_at: IsNull() },
      relations: ['rol'],
      order: { nombre: 'ASC' },
      select: ['id', 'nombre', 'email', 'activo', 'created_at', 'rol_id'],
    });
  }

  async getRoles() {
    return this.rolRepo.find();
  }

  async findOne(id: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['rol'],
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    const { password_hash, ...rest } = usuario;
    return rest;
  }

  async create(dto: CreateUsuarioDto) {
    const existe = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (existe) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.usuarioRepo.create({
      id: uuid(),
      rol_id: dto.rol_id,
      nombre: dto.nombre,
      email: dto.email,
      password_hash: hash,
      activo: true,
    });
    await this.usuarioRepo.save(usuario);
    const { password_hash, ...rest } = usuario;
    return rest;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepo.findOne({ where: { id, deleted_at: IsNull() } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (dto.email && dto.email !== usuario.email) {
      const existe = await this.usuarioRepo.findOne({ where: { email: dto.email } });
      if (existe) throw new ConflictException('El email ya está en uso');
    }

    Object.assign(usuario, { nombre: dto.nombre, email: dto.email, rol_id: dto.rol_id });
    await this.usuarioRepo.save(usuario);
    const { password_hash, ...rest } = usuario;
    return rest;
  }

  async changePassword(id: string, nuevaPassword: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { id, deleted_at: IsNull() } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    usuario.password_hash = await bcrypt.hash(nuevaPassword, 10);
    await this.usuarioRepo.save(usuario);
    return { message: 'Contraseña actualizada correctamente' };
  }

  async setActivo(id: string, activo: boolean) {
    const usuario = await this.usuarioRepo.findOne({ where: { id, deleted_at: IsNull() } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    usuario.activo = activo;
    await this.usuarioRepo.save(usuario);
    return { message: activo ? 'Usuario activado' : 'Usuario desactivado' };
  }

  async remove(id: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { id, deleted_at: IsNull() } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    usuario.deleted_at = new Date();
    await this.usuarioRepo.save(usuario);
  }
}
