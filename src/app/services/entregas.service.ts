import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Entrega } from './entities/entrega.entity';
import { DetalleEntrega } from './entities/detalle-entrega.entity';
import { Devolucion } from './entities/devolucion.entity';
import { DetalleDevolucion } from './entities/detalle-devolucion.entity';
import { Reutilizacion } from './entities/reutilizacion.entity';
import { LoteProducto } from '../productos/entities/lote-producto.entity';
import { Cliente } from '../../domain/entitites/cliente.entity';
import { CuentaPorCobrar } from '../../domain/entitites/cuenta-por-cobrar.entity';
import { Transaccion } from '../contabilidad/entities/transaccion.entity';
import { CreateEntregaDto } from '../../domain/dto/create-entrega.dto';
import { CreateDevolucionDto } from '../../domain/dto/create-devolucion.dto';

@Injectable()
export class EntregasService {
  constructor(
    @InjectRepository(Entrega)           private entregaRepo: Repository<Entrega>,
    @InjectRepository(DetalleEntrega)    private detalleRepo: Repository<DetalleEntrega>,
    @InjectRepository(Devolucion)        private devRepo: Repository<Devolucion>,
    @InjectRepository(DetalleDevolucion) private detDevRepo: Repository<DetalleDevolucion>,
    @InjectRepository(Reutilizacion)     private reutRepo: Repository<Reutilizacion>,
    @InjectRepository(LoteProducto)      private loteRepo: Repository<LoteProducto>,
    @InjectRepository(Cliente)           private clienteRepo: Repository<Cliente>,
    @InjectRepository(CuentaPorCobrar)   private cxcRepo: Repository<CuentaPorCobrar>,
    @InjectRepository(Transaccion)       private txRepo: Repository<Transaccion>,
  ) {}

  async findAll(filtros: { clienteId?: string; estado?: string; fecha?: string }) {
    const qb = this.entregaRepo.createQueryBuilder('e')
      .leftJoinAndSelect('e.cliente', 'c')
      .leftJoinAndSelect('e.usuario', 'u')
      .orderBy('e.fecha_entrega', 'DESC');

    if (filtros.clienteId) qb.andWhere('e.cliente_id = :cid', { cid: filtros.clienteId });
    if (filtros.estado)    qb.andWhere('e.estado = :est', { est: filtros.estado });
    if (filtros.fecha)     qb.andWhere('e.fecha_entrega = :fecha', { fecha: filtros.fecha });

    return qb.getMany();
  }

  async pendientesRecoleccion() {
    return this.entregaRepo.find({
      where: { estado: 'entregada' },
      relations: ['cliente'],
      order: { fecha_entrega: 'ASC' },
    });
  }

  async findOne(id: string) {
    const entrega = await this.entregaRepo.findOne({
      where: { id },
      relations: ['cliente', 'usuario', 'detalles', 'detalles.lote', 'detalles.lote.producto', 'detalles.charola'],
    });
    if (!entrega) throw new NotFoundException('Entrega no encontrada');
    return entrega;
  }

  async create(dto: CreateEntregaDto, usuarioId: string) {
    const cliente = await this.clienteRepo.findOne({ where: { id: dto.cliente_id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    if (cliente.bloqueado) throw new BadRequestException('Cliente bloqueado por deuda');

    let totalValor = 0;

    for (const item of dto.items) {
      const lote = await this.loteRepo.findOne({ where: { id: item.lote_producto_id } });
      if (!lote) throw new NotFoundException(`Lote ${item.lote_producto_id} no encontrado`);
      if (lote.cantidad_disponible < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente en lote ${lote.numero_lote}`);
      }
      totalValor += item.cantidad * item.precio_unitario;
    }

    if (cliente.saldo_pendiente + totalValor > cliente.limite_credito) {
      throw new BadRequestException(
        `La entrega supera el límite de crédito del cliente ($${cliente.limite_credito} MXN)`,
      );
    }

    const entregaId = uuid();
    const entrega = await this.entregaRepo.save(
      this.entregaRepo.create({
        id: entregaId,
        cliente_id: dto.cliente_id,
        usuario_id: usuarioId,
        fecha_entrega: dto.fecha_entrega as any,
        fecha_recoleccion_prog: dto.fecha_recoleccion_prog as any,
        total_entregado_valor: totalValor,
        estado: 'preparando',
      }),
    );

    for (const item of dto.items) {
      const lote = await this.loteRepo.findOne({ where: { id: item.lote_producto_id } });
      await this.detalleRepo.save(
        this.detalleRepo.create({
          id: uuid(),
          entrega_id: entregaId,
          lote_producto_id: item.lote_producto_id,
          charola_id: item.charola_id,
          cantidad_entregada: item.cantidad,
          precio_unitario: item.precio_unitario,
        }),
      );
      lote.cantidad_disponible -= item.cantidad;
      await this.loteRepo.save(lote);
    }

    return entrega;
  }

  async cambiarEstado(id: string, estado: string, usuarioId: string) {
    const entrega = await this.findOne(id);
    entrega.estado = estado as any;
    return this.entregaRepo.save(entrega);
  }

  async registrarDevolucion(entregaId: string, dto: CreateDevolucionDto, usuarioId: string) {
    const entrega = await this.findOne(entregaId);
    if (entrega.estado !== 'entregada') {
      throw new BadRequestException('Solo se pueden registrar devoluciones de entregas entregadas');
    }

    const devolucionId = uuid();
    const devolucion = await this.devRepo.save(
      this.devRepo.create({
        id: devolucionId,
        entrega_id: entregaId,
        usuario_id: usuarioId,
        fecha_devolucion: dto.fecha_devolucion as any,
        estado: 'procesada',
      }),
    );

    let totalDevueltoValor = 0;

    for (const item of dto.items) {
      const detalle = await this.detalleRepo.findOne({ where: { id: item.detalle_entrega_id } });
      if (!detalle) throw new NotFoundException('Detalle de entrega no encontrado');
      if (item.cantidad_devuelta > detalle.cantidad_entregada) {
        throw new BadRequestException('No puedes devolver más de lo entregado');
      }

      await this.detDevRepo.save(
        this.detDevRepo.create({
          id: uuid(),
          devolucion_id: devolucionId,
          detalle_entrega_id: item.detalle_entrega_id,
          cantidad_devuelta: item.cantidad_devuelta,
          reutilizable: item.reutilizable ?? false,
          motivo: item.motivo,
        }),
      );

      const lote = await this.loteRepo.findOne({ where: { id: detalle.lote_producto_id } });
      lote.cantidad_devuelta += item.cantidad_devuelta;
      lote.cantidad_vendida  += detalle.cantidad_entregada - item.cantidad_devuelta;
      await this.loteRepo.save(lote);

      totalDevueltoValor += item.cantidad_devuelta * detalle.precio_unitario;
    }

    const ventaReal = entrega.total_entregado_valor - totalDevueltoValor;
    entrega.total_vendido_valor  = ventaReal;
    entrega.total_devuelto_valor = totalDevueltoValor;
    entrega.estado = 'recolectada';
    await this.entregaRepo.save(entrega);

    await this.generarCuentaCobrar(entrega, ventaReal, usuarioId);

    return { devolucion, ventaReal, totalDevueltoValor };
  }

  private async generarCuentaCobrar(entrega: Entrega, monto: number, usuarioId: string) {
    const vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + 1);

    const cxc = await this.cxcRepo.save(
      this.cxcRepo.create({
        id: uuid(),
        cliente_id: entrega.cliente_id,
        entrega_id: entrega.id,
        monto_original: monto,
        fecha_emision: new Date(),
        fecha_vencimiento: vencimiento,
        estado: 'pendiente',
      }),
    );

    const cliente = await this.clienteRepo.findOne({ where: { id: entrega.cliente_id } });
    cliente.saldo_pendiente += monto;
    await this.clienteRepo.save(cliente);

    await this.txRepo.save(
      this.txRepo.create({
        id: uuid(),
        usuario_id: usuarioId,
        tipo: 'ingreso',
        categoria: 'venta',
        monto,
        referencia_id: entrega.id,
        referencia_tipo: 'entregas',
        descripcion: `Venta entrega #${entrega.id.slice(0, 8)}`,
        fecha: new Date(),
      }),
    );

    return cxc;
  }

  async reutilizar(body: { detalle_devolucion_id: string; orden_produccion_id: string; cantidad: number }) {
    const detDev = await this.detDevRepo.findOne({ where: { id: body.detalle_devolucion_id } });
    if (!detDev) throw new NotFoundException('Detalle de devolución no encontrado');
    if (!detDev.reutilizable) throw new BadRequestException('Este producto no está marcado como reutilizable');

    return this.reutRepo.save(
      this.reutRepo.create({
        id: uuid(),
        detalle_devolucion_id: body.detalle_devolucion_id,
        orden_produccion_id: body.orden_produccion_id,
        cantidad: body.cantidad,
      }),
    );
  }

  async generarNotaPdf(id: string) {
    return this.findOne(id);
  }
}
