import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Cliente } from '../../domain/entitites/cliente.entity';
import { CreateClienteDto } from '../../domain/dto/create-cliente.dto';
import { UpdateClienteDto } from '../../domain/dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
  ) {}

  async findAll(filtros: { search?: string; tipo?: string; bloqueado?: string }) {
    const qb = this.clienteRepo.createQueryBuilder('c')
      .where('c.deleted_at IS NULL')
      .andWhere('c.activo = 1');

    if (filtros.search) {
      qb.andWhere('(c.nombre_negocio LIKE :s OR c.responsable LIKE :s OR c.telefono LIKE :s)', {
        s: `%${filtros.search}%`,
      });
    }
    if (filtros.tipo) qb.andWhere('c.tipo = :tipo', { tipo: filtros.tipo });
    if (filtros.bloqueado === 'true') qb.andWhere('c.bloqueado = 1');

    return qb.orderBy('c.nombre_negocio', 'ASC').getMany();
  }

  async morosos() {
    return this.clienteRepo
      .createQueryBuilder('c')
      .where('c.deleted_at IS NULL AND c.activo = 1')
      .andWhere('c.saldo_pendiente > 0')
      .orderBy('c.saldo_pendiente', 'DESC')
      .getMany();
  }

  async findOne(id: string) {
    const cliente = await this.clienteRepo.findOne({ where: { id, deleted_at: IsNull() } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async historial(id: string) {
    await this.findOne(id);
    // Las entregas y cuentas por cobrar se consultan desde sus propios módulos
    // Aquí retornamos el resumen del cliente
    return this.clienteRepo
      .createQueryBuilder('c')
      .where('c.id = :id', { id })
      .getOne();
  }

  async create(dto: CreateClienteDto) {
    const cliente = this.clienteRepo.create({ id: uuid(), ...dto });
    return this.clienteRepo.save(cliente);
  }

  async update(id: string, dto: UpdateClienteDto) {
    const cliente = await this.findOne(id);
    Object.assign(cliente, dto);
    return this.clienteRepo.save(cliente);
  }

  async setBloqueado(id: string, bloqueado: boolean) {
    const cliente = await this.findOne(id);
    cliente.bloqueado = bloqueado;
    await this.clienteRepo.save(cliente);
    return { message: bloqueado ? 'Cliente bloqueado' : 'Cliente desbloqueado' };
  }

  async remove(id: string) {
    const cliente = await this.findOne(id);
    cliente.deleted_at = new Date();
    await this.clienteRepo.save(cliente);
  }
}
