import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { ProductoTerminado, LoteProducto } from './entities/producto-terminado.entity';
import { CreateProductoDto } from '../../domain/dto/create-producto.dto';
import { UpdateProductoDto } from '../../domain/dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(ProductoTerminado) private productoRepo: Repository<ProductoTerminado>,
    @InjectRepository(LoteProducto)      private loteRepo: Repository<LoteProducto>,
  ) {}

  async findAll(filtros: { search?: string; categoria?: string }) {
    const qb = this.productoRepo.createQueryBuilder('p')
      .where('p.deleted_at IS NULL AND p.activo = 1');

    if (filtros.search) qb.andWhere('p.nombre LIKE :s', { s: `%${filtros.search}%` });
    if (filtros.categoria) qb.andWhere('p.categoria = :c', { c: filtros.categoria });

    return qb.orderBy('p.nombre', 'ASC').getMany();
  }

  async porCaducar(dias: number) {
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    return this.loteRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.producto', 'p')
      .where('l.cantidad_disponible > 0')
      .andWhere('l.fecha_caducidad IS NOT NULL')
      .andWhere('l.fecha_caducidad <= :limite', { limite })
      .andWhere('l.fecha_caducidad >= CURDATE()')
      .orderBy('l.fecha_caducidad', 'ASC')
      .getMany();
  }

  async findOne(id: string) {
    const producto = await this.productoRepo.findOne({ where: { id, deleted_at: IsNull() } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async getLotes(productoId: string) {
    return this.loteRepo.find({
      where: { producto_id: productoId, cantidad_disponible: MoreThan(0) },
      order: { fecha_caducidad: 'ASC' },
    });
  }

  async create(dto: CreateProductoDto) {
    const producto = this.productoRepo.create({ id: uuid(), ...dto });
    return this.productoRepo.save(producto);
  }

  async update(id: string, dto: UpdateProductoDto) {
    const producto = await this.findOne(id);
    Object.assign(producto, dto);
    return this.productoRepo.save(producto);
  }

  async remove(id: string) {
    const producto = await this.findOne(id);
    producto.deleted_at = new Date();
    await this.productoRepo.save(producto);
  }
}
