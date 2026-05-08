import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CuentaPorCobrar, Pago, Transaccion } from '../../domain/entitites/cuenta-por-cobrar.entity';
import { Cliente } from '../../domain/entitites/cliente.entity';
import { RegistrarPagoDto } from '../../domain/dto/registrar-pago.dto';

@Injectable()
export class ContabilidadService {
  constructor(
    @InjectRepository(CuentaPorCobrar) private cxcRepo: Repository<CuentaPorCobrar>,
    @InjectRepository(Pago)            private pagoRepo: Repository<Pago>,
    @InjectRepository(Transaccion)     private txRepo: Repository<Transaccion>,
    @InjectRepository(Cliente)         private clienteRepo: Repository<Cliente>,
  ) {}

  async resumen(periodo: 'diario' | 'semanal' | 'mensual') {
    const hoy = new Date();
    let fechaInicio: Date;

    if (periodo === 'diario') {
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    } else if (periodo === 'semanal') {
      fechaInicio = new Date(hoy);
      fechaInicio.setDate(hoy.getDate() - 7);
    } else {
      fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    }

    const result = await this.txRepo
      .createQueryBuilder('t')
      .select([
        'SUM(CASE WHEN t.tipo = :ingreso THEN t.monto ELSE 0 END) AS total_ingresos',
        'SUM(CASE WHEN t.tipo = :egreso THEN t.monto ELSE 0 END) AS total_egresos',
        'SUM(CASE WHEN t.tipo = :ingreso THEN t.monto ELSE -t.monto END) AS utilidad',
      ])
      .where('t.fecha >= :inicio', { inicio: fechaInicio })
      .setParameters({ ingreso: 'ingreso', egreso: 'egreso' })
      .getRawOne();

    const cxcPendiente = await this.cxcRepo
      .createQueryBuilder('c')
      .select('SUM(c.monto_original + c.interes_acumulado - c.monto_pagado)', 'total')
      .where("c.estado IN ('pendiente', 'vencida')")
      .getRawOne();

    return {
      periodo,
      total_ingresos: Number(result?.total_ingresos ?? 0),
      total_egresos: Number(result?.total_egresos ?? 0),
      utilidad: Number(result?.utilidad ?? 0),
      cuentas_por_cobrar: Number(cxcPendiente?.total ?? 0),
    };
  }

  async cuentasPorCobrar(filtros: { clienteId?: string; estado?: string }) {
    const qb = this.cxcRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.cliente', 'cl')
      .orderBy('c.fecha_vencimiento', 'ASC');

    if (filtros.clienteId) qb.andWhere('c.cliente_id = :cid', { cid: filtros.clienteId });
    if (filtros.estado)    qb.andWhere('c.estado = :est', { est: filtros.estado });

    return qb.getMany();
  }

  async findCxC(id: string) {
    const cxc = await this.cxcRepo.findOne({ where: { id }, relations: ['cliente'] });
    if (!cxc) throw new NotFoundException('Cuenta por cobrar no encontrada');
    return cxc;
  }

  async registrarPago(cxcId: string, dto: RegistrarPagoDto, usuarioId: string) {
    const cxc = await this.findCxC(cxcId);
    if (cxc.estado === 'pagada') throw new BadRequestException('Esta cuenta ya está pagada');

    const saldoPendiente = cxc.monto_original + cxc.interes_acumulado - cxc.monto_pagado;
    if (dto.monto > saldoPendiente) {
      throw new BadRequestException(`El monto excede el saldo pendiente de $${saldoPendiente.toFixed(2)} MXN`);
    }

    const pago = await this.pagoRepo.save(
      this.pagoRepo.create({
        id: uuid(),
        cuenta_cobrar_id: cxcId,
        usuario_id: usuarioId,
        monto: dto.monto,
        metodo_pago: dto.metodo_pago,
        fecha_pago: dto.fecha_pago as any,
        notas: dto.notas,
      }),
    );

    cxc.monto_pagado += dto.monto;
    if (cxc.monto_pagado >= cxc.monto_original + cxc.interes_acumulado) {
      cxc.estado = 'pagada';
    }
    await this.cxcRepo.save(cxc);

    // Actualizar saldo del cliente
    const cliente = await this.clienteRepo.findOne({ where: { id: cxc.cliente_id } });
    cliente.saldo_pendiente = Math.max(0, cliente.saldo_pendiente - dto.monto);
    if (cliente.bloqueado && cliente.saldo_pendiente <= cliente.limite_credito) {
      cliente.bloqueado = false;
    }
    await this.clienteRepo.save(cliente);

    // Registrar transacción contable
    await this.txRepo.save(
      this.txRepo.create({
        id: uuid(),
        usuario_id: usuarioId,
        tipo: 'ingreso',
        categoria: 'pago_recibido',
        monto: dto.monto,
        referencia_id: pago.id,
        referencia_tipo: 'pagos',
        descripcion: `Pago recibido de ${cliente.nombre_negocio}`,
        fecha: new Date(),
      }),
    );

    return { pago, cxc };
  }

  async transacciones(filtros: { fechaInicio?: string; fechaFin?: string; tipo?: string; categoria?: string }) {
    const qb = this.txRepo.createQueryBuilder('t').orderBy('t.fecha', 'DESC');

    if (filtros.fechaInicio) qb.andWhere('t.fecha >= :fi', { fi: filtros.fechaInicio });
    if (filtros.fechaFin)    qb.andWhere('t.fecha <= :ff', { ff: filtros.fechaFin });
    if (filtros.tipo)        qb.andWhere('t.tipo = :tipo', { tipo: filtros.tipo });
    if (filtros.categoria)   qb.andWhere('t.categoria = :cat', { cat: filtros.categoria });

    return qb.getMany();
  }

  async morosos() {
    return this.cxcRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.cliente', 'cl')
      .where("c.estado = 'vencida'")
      .orderBy('c.fecha_vencimiento', 'ASC')
      .getMany();
  }
}
