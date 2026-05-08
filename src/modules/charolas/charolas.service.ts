import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Charola } from './entitties/charola.entity';
import { CreateCharolaDto } from './dto/create-charola.dto';

@Injectable()
export class CharolasService {
  constructor(
    @InjectRepository(Charola) private charolaRepo: Repository<Charola>,
  ) {}

  async findAll(estado?: string) {
    const where: any = { activo: true };
    if (estado) where.estado = estado;
    return this.charolaRepo.find({ where, order: { numeroInterno: 'ASC' } });
  }

  async findOne(id: string) {
    const charola = await this.charolaRepo.findOne({ where: { id } });
    if (!charola) throw new NotFoundException('Charola no encontrada');
    return charola;
  }

  async create(dto: CreateCharolaDto) {
    const existe = await this.charolaRepo.findOne({ where: { numeroInterno: dto.numeroInterno } });
    if (existe) throw new BadRequestException('Ya existe una charola con ese número');
    const charola = this.charolaRepo.create({ id: uuid(), ...dto });
    return this.charolaRepo.save(charola);
  }

  async cambiarEstado(id: string, estado: string) {
    const charola = await this.findOne(id);
    charola.estado = estado as any;
    return this.charolaRepo.save(charola);
  }

  async remove(id: string) {
    const charola = await this.findOne(id);
    charola.activo = false;
    charola.estado = 'baja';
    await this.charolaRepo.save(charola);
  }
}
