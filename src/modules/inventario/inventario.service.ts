import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateMateriaPrimaDto } from './dto/create-materia-prima.dto';
import { MovimientoDto } from './dto/movimiento.dto';
import { FiltrosInventarioDto } from './dto/filtros-inventario.dto';
import { CreateConversionDto } from './dto/create-conversion.dto';
import { MateriaPrima } from './entitties/materia-prima.entity';
import { MovimientoInventario } from './entitties/movimiento-inventario.entity';
import { ConversionUnidad } from './entitties/conversion-unidad.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { UpdateMateriaPrimaDto } from './dto/update-materia-prima.dto';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(MateriaPrima)         private mpRepo: Repository<MateriaPrima>,
    @InjectRepository(MovimientoInventario) private movRepo: Repository<MovimientoInventario>,
    @InjectRepository(ConversionUnidad)     private convRepo: Repository<ConversionUnidad>,
    private notifService: NotificacionesService,
  ) {}

  async findAll(filtros: FiltrosInventarioDto) {
    const qb = this.mpRepo.createQueryBuilder('mp')
      .where('mp.deleted_at IS NULL')
      .andWhere('mp.activo = :activo', { activo: true });

    if (filtros.search) {
      qb.andWhere('mp.nombre LIKE :search', { search: `%${filtros.search}%` });
    }
    if (filtros.categoria) {
      qb.andWhere('mp.categoria = :cat', { cat: filtros.categoria });
    }
    if (filtros.stockBajo === 'true') {
      qb.andWhere('mp.stockActual <= mp.stockMinimo');
    }

    return qb.orderBy('mp.nombre', 'ASC').getMany();
  }

  async stockBajo() {
    return this.mpRepo
      .createQueryBuilder('mp')
      .where('mp.deleted_at IS NULL AND mp.activo = 1')
      .andWhere('mp.stockActual <= mp.stockMinimo')
      .orderBy('mp.stockActual', 'ASC')
      .getMany();
  }

  async findOne(id: string) {
    const mp = await this.mpRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!mp) throw new NotFoundException('Materia prima no encontrada');
    return mp;
  }

  async create(dto: CreateMateriaPrimaDto, usuarioId: string) {
    const mp = this.mpRepo.create({ id: uuid(), ...dto });
    return this.mpRepo.save(mp);
  }

  async update(id: string, dto: UpdateMateriaPrimaDto, usuarioId: string) {
    const mp = await this.findOne(id);
    Object.assign(mp, dto);
    return this.mpRepo.save(mp);
  }

  async remove(id: string) {
    const mp = await this.findOne(id);
    mp.deletedAt = new Date();
    await this.mpRepo.save(mp);
  }

  async registrarMovimiento(
    materiaPrimaId: string,
    tipo: 'entrada' | 'salida' | 'ajuste' | 'desperdicio',
    dto: MovimientoDto,
    usuarioId: string,
  ) {
    const mp = await this.findOne(materiaPrimaId);

    const cantidadEnPrincipal = await this.convertir(
      materiaPrimaId, dto.cantidad, dto.unidad, mp.unidadPrincipal,
    );

    const stockAnterior = mp.stockActual;

    if (tipo === 'entrada') {
      mp.stockActual += cantidadEnPrincipal;
      mp.fechaUltimaCompra = new Date();
    } else if (tipo === 'ajuste') {
      mp.stockActual = cantidadEnPrincipal;
    } else {
      if (mp.stockActual < cantidadEnPrincipal) {
        throw new BadRequestException('Stock insuficiente');
      }
      mp.stockActual -= cantidadEnPrincipal;
    }

    await this.mpRepo.save(mp);

    const movimiento = await this.movRepo.save(
      this.movRepo.create({
        id: uuid(),
        materiaPrimaId: materiaPrimaId,
        usuarioId: usuarioId,
        tipo,
        cantidad: dto.cantidad,
        unidad: dto.unidad,
        costoUnitario: dto.costoUnitario,
        stockAnterior: stockAnterior,
        stockPosterior: mp.stockActual,
        referenciaId: dto.referenciaId,
        referenciaTipo: dto.referenciaTipo,
        notas: dto.notas,
      }),
    );

    if (mp.stockActual <= mp.stockMinimo) {
      await this.notifService.crearAlertaStockBajo(mp);
    }

    return { mp, movimiento };
  }

  async getMovimientos(materiaPrimaId: string, limit: number) {
    return this.movRepo.find({
      where: { materiaPrimaId: materiaPrimaId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getConversiones(materiaPrimaId: string) {
    return this.convRepo.find({ where: { materiaPrimaId: materiaPrimaId } });
  }

  async addConversion(materiaPrimaId: string, dto: CreateConversionDto) {
    const conv = this.convRepo.create({ id: uuid(), materiaPrimaId: materiaPrimaId, ...dto });
    return this.convRepo.save(conv);
  }

  async convertir(
    materiaPrimaId: string,
    cantidad: number,
    unidadOrigen: string,
    unidadDestino: string,
  ): Promise<number> {
    if (unidadOrigen === unidadDestino) return cantidad;

    const conv = await this.convRepo.findOne({
      where: { materiaPrimaId: materiaPrimaId, unidadOrigen: unidadOrigen, unidadDestino: unidadDestino },
    });
    if (!conv) {
      throw new BadRequestException(
        `No existe conversión de ${unidadOrigen} a ${unidadDestino} para esta materia prima`,
      );
    }
    return cantidad * Number(conv.factor);
  }

  async descontarParaProduccion(
    materiaPrimaId: string,
    cantidad: number,
    unidad: string,
    usuarioId: string,
    ordenId: string,
  ) {
    return this.registrarMovimiento(materiaPrimaId, 'salida', {
      cantidad,
      unidad,
      notas: `Descuento automático por orden de producción ${ordenId}`,
      referenciaId: ordenId,
      referenciaTipo: 'ordenes_produccion',
    } as MovimientoDto, usuarioId);
  }
}
