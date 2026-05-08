import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { MateriaPrima } from './entities/materia-prima.entity';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { ConversionUnidad } from './entities/conversion-unidad.entity';
import { CreateMateriaPrimaDto } from '../../domain/dto/create-materia-prima.dto';
import { UpdateMateriaPrimaDto } from '../../domain/dto/update-materia-prima.dto';
import { MovimientoDto } from '../../domain/dto/movimiento.dto';
import { FiltrosInventarioDto } from '../../domain/dto/filtros-inventario.dto';
import { CreateConversionDto } from '../../domain/dto/create-conversion.dto';
import { NotificacionesService } from '../modules/notificaciones/notificaciones.service';

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
      qb.andWhere('mp.stock_actual <= mp.stock_minimo');
    }

    return qb.orderBy('mp.nombre', 'ASC').getMany();
  }

  async stockBajo() {
    return this.mpRepo
      .createQueryBuilder('mp')
      .where('mp.deleted_at IS NULL AND mp.activo = 1')
      .andWhere('mp.stock_actual <= mp.stock_minimo')
      .orderBy('mp.stock_actual', 'ASC')
      .getMany();
  }

  async findOne(id: string) {
    const mp = await this.mpRepo.findOne({ where: { id, deleted_at: IsNull() } });
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
    mp.deleted_at = new Date();
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
      materiaPrimaId, dto.cantidad, dto.unidad, mp.unidad_principal,
    );

    const stockAnterior = mp.stock_actual;

    if (tipo === 'entrada') {
      mp.stock_actual += cantidadEnPrincipal;
      mp.fecha_ultima_compra = new Date();
    } else if (tipo === 'ajuste') {
      mp.stock_actual = cantidadEnPrincipal;
    } else {
      if (mp.stock_actual < cantidadEnPrincipal) {
        throw new BadRequestException('Stock insuficiente');
      }
      mp.stock_actual -= cantidadEnPrincipal;
    }

    await this.mpRepo.save(mp);

    const movimiento = await this.movRepo.save(
      this.movRepo.create({
        id: uuid(),
        materia_prima_id: materiaPrimaId,
        usuario_id: usuarioId,
        tipo,
        cantidad: dto.cantidad,
        unidad: dto.unidad,
        costo_unitario: dto.costo_unitario,
        stock_anterior: stockAnterior,
        stock_posterior: mp.stock_actual,
        referencia_id: dto.referencia_id,
        referencia_tipo: dto.referencia_tipo,
        notas: dto.notas,
      }),
    );

    if (mp.stock_actual <= mp.stock_minimo) {
      await this.notifService.crearAlertaStockBajo(mp);
    }

    return { mp, movimiento };
  }

  async getMovimientos(materiaPrimaId: string, limit: number) {
    return this.movRepo.find({
      where: { materia_prima_id: materiaPrimaId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getConversiones(materiaPrimaId: string) {
    return this.convRepo.find({ where: { materia_prima_id: materiaPrimaId } });
  }

  async addConversion(materiaPrimaId: string, dto: CreateConversionDto) {
    const conv = this.convRepo.create({ id: uuid(), materia_prima_id: materiaPrimaId, ...dto });
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
      where: { materia_prima_id: materiaPrimaId, unidad_origen: unidadOrigen, unidad_destino: unidadDestino },
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
      referencia_id: ordenId,
      referencia_tipo: 'ordenes_produccion',
    } as MovimientoDto, usuarioId);
  }
}
