import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../usuarios/entitties/rol.entity';

@Injectable()
export class CatalogosService {
  constructor(
    @InjectRepository(Rol) private clienteRepo: Repository<Rol>,
  ) {}

  async findAll(filtros: { search?: string; bloqueado?: string }) {
    const qb = this.clienteRepo.createQueryBuilder('c')

    if (filtros.search) {
      qb.andWhere('(c.nombre LIKE :s)', {
        s: `%${filtros.search}%`,
      });
    }
    return qb.orderBy('c.nombre', 'ASC').getMany();
  }
}
