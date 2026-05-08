import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Cliente } from '../clientes/entitties/cliente.entity';
import { CuentaPorCobrar } from '../contabilidad/entitties/cuenta-por-cobrar.entity';
import { CreateEntregaDto } from './dto/create-entrega.dto';
import { CreateDevolucionDto } from './dto/create-devolucion.dto';
import { Entrega } from './entitties/entrega.entity';
import { DetalleEntrega } from './entitties/detalle-entrega.entity';
import { Devolucion } from './entitties/devolucion.entity';
import { DetalleDevolucion } from './entitties/detalle-devolucion.entity';
import { Reutilizacion } from './entitties/reutilizacion.entity';
import { LoteProducto } from '../productos/entitties/lote-producto.entity';
import { Transaccion } from '../contabilidad/entitties/transaccion.entity';

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
      .orderBy('e.fechaEntrega', 'DESC');

    if (filtros.clienteId) qb.andWhere('e.clienteId = :cid', { cid: filtros.clienteId });
    if (filtros.estado)    qb.andWhere('e.estado = :est', { est: filtros.estado });
    if (filtros.fecha)     qb.andWhere('e.fechaEntrega = :fecha', { fecha: filtros.fecha });

    return qb.getMany();
  }

  async pendientesRecoleccion() {
    return this.entregaRepo.find({
      where: { estado: 'entregada' },
      relations: ['cliente'],
      order: { fechaEntrega: 'ASC' },
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
    const cliente = await this.clienteRepo.findOne({ where: { id: dto.clienteId } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    if (cliente.bloqueado) throw new BadRequestException('Cliente bloqueado por deuda');

    let totalValor = 0;

    for (const item of dto.items) {
      const lote = await this.loteRepo.findOne({ where: { id: item.loteProductoId } });
      if (!lote) throw new NotFoundException(`Lote ${item.loteProductoId} no encontrado`);
      if (lote?.cantidadDisponible < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente en lote ${lote.numeroLote}`);
      }
      totalValor += item.cantidad * item.precioUnitario;
    }

    if (cliente?.saldoPendiente + totalValor > cliente.limiteCredito) {
      throw new BadRequestException(
        `La entrega supera el límite de crédito del cliente ($${cliente.limiteCredito} MXN)`,
      );
    }

    const entregaId = dto.id ?? uuid();
    const entrega = await this.entregaRepo.save(
      this.entregaRepo.create({
        id: entregaId,
        clienteId: dto.clienteId,
        usuarioId: usuarioId,
        fechaEntrega: dto.fechaEntrega as any,
        fechaRecoleccionProg: dto.fechaRecoleccionProg as any,
        totalEntregadoValor: totalValor,
        estado: 'preparando',
      }),
    );

    for (const item of dto.items) {
      const lote = await this.loteRepo.findOne({ where: { id: item.loteProductoId } });
      await this.detalleRepo.save(
        this.detalleRepo.create({
          id: uuid(),
          entregaId: entregaId,
          loteProductoId: item.loteProductoId,
          charolaId: item.charolaId,
          cantidadEntregada: item.cantidad,
          precioUnitario: item.precioUnitario,
        }),
      );
      lote!.cantidadDisponible -= item.cantidad;
      await this.loteRepo.save(lote!);
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
        entregaId: entregaId,
        usuarioId: usuarioId,
        fechaDevolucion: dto.fechaDevolucion,
        estado: 'procesada',
      }),
    );

    let totalDevueltoValor = 0;

    for (const item of dto.items) {
      const detalle = await this.detalleRepo.findOne({ where: { id: item.detalleEntregaId } });
      if (!detalle) throw new NotFoundException('Detalle de entrega no encontrado');
      if (item.cantidadDevuelta > detalle.cantidadEntregada) {
        throw new BadRequestException('No puedes devolver más de lo entregado');
      }

      await this.detDevRepo.save(
        this.detDevRepo.create({
          id: uuid(),
          devolucionId: devolucionId,
          detalleEntregaId: item.detalleEntregaId,
          cantidadDevuelta: item.cantidadDevuelta,
          reutilizable: item.reutilizable ?? false,
          motivo: item.motivo,
        }),
      );

      const lote = await this.loteRepo.findOne({ where: { id: detalle.loteProductoId } });
      if(!lote) throw new BadRequestException('No existe el lote');
      lote.cantidadDevuelta += item.cantidadDevuelta;
      lote.cantidadVendida  += detalle.cantidadEntregada - item.cantidadDevuelta;
      await this.loteRepo.save(lote);

      totalDevueltoValor += item.cantidadDevuelta * detalle.precioUnitario;
    }

    const ventaReal = entrega.totalEntregadoValor - totalDevueltoValor;
    entrega.totalVendidoValor  = ventaReal;
    entrega.totalDevueltoValor = totalDevueltoValor;
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
        id: entrega?.id ?? uuid(),
        clienteId: entrega.clienteId,
        entregaId: entrega.id,
        montoPagado: monto,
        fechaEmision: new Date(),
        fechaVencimiento: vencimiento,
        estado: 'pendiente',
      }),
    );

    const cliente = await this.clienteRepo.findOne({ where: { id: entrega.clienteId } });
    if(!cliente) throw new BadRequestException(`No existe el cliente con el id: ${entrega.clienteId}`);
    cliente.saldoPendiente += monto;
    await this.clienteRepo.save(cliente);

    await this.txRepo.save(
      this.txRepo.create({
        id: entrega?.id ?? uuid(),
        usuarioId: usuarioId,
        tipo: 'ingreso',
        categoria: 'venta',
        monto,
        referenciaId: entrega.id,
        referenciaTipo: 'entregas',
        descripcion: `Venta entrega #${entrega.id.slice(0, 8)}`,
        fecha: new Date(),
      }),
    );

    return cxc;
  }

  async reutilizar(body: { detalleDevolucionId: string; ordenProduccionId: string; cantidad: number }) {
    const detDev = await this.detDevRepo.findOne({ where: { id: body.detalleDevolucionId } });
    if (!detDev) throw new NotFoundException('Detalle de devolución no encontrado');
    if (!detDev.reutilizable) throw new BadRequestException('Este producto no está marcado como reutilizable');

    return this.reutRepo.save(
      this.reutRepo.create({
        id: uuid(),
        detalleDevolucionId: body.detalleDevolucionId,
        ordenProduccionId: body.ordenProduccionId,
        cantidad: body.cantidad,
      }),
    );
  }

  async generarNotaPdf(id: string) {
    return this.findOne(id);
  }
}
