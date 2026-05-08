import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Cliente } from '../clientes/entitties/cliente.entity';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { CuentaPorCobrar } from './entitties/cuenta-por-cobrar.entity';
import { Pago } from './entitties/pago.entity';
import { Transaccion } from './entitties/transaccion.entity';

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
      .select('SUM(c.montoOriginal + c.interesAcumulado - c.montoPagado)', 'total')
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

    if (filtros.clienteId) qb.andWhere('c.clienteId = :cid', { cid: filtros.clienteId });
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

    const saldoPendiente = cxc.montoOriginal + cxc.interesAcumulado - cxc.montoPagado;
    if (dto.monto > saldoPendiente) {
      throw new BadRequestException(`El monto excede el saldo pendiente de $${saldoPendiente.toFixed(2)} MXN`);
    }

    const pago = await this.pagoRepo.save(
      this.pagoRepo.create({
        id: uuid(),
        cuentaCobrarId: cxcId,
        usuarioId: usuarioId,
        monto: dto.monto,
        metodoPago: dto.metodoPago,
        fechaPago: dto.fechaPago,
        notas: dto.notas,
      }),
    );

    cxc.montoPagado += dto.monto;
    if (cxc.montoPagado >= cxc.montoOriginal + cxc.interesAcumulado) {
      cxc.estado = 'pagada';
    }
    await this.cxcRepo.save(cxc);

    // Actualizar saldo del cliente
    const cliente = await this.clienteRepo.findOne({ where: { id: cxc.clienteId } });
    if(!cliente) throw new BadRequestException(`El cliente no existe`);
    
    cliente.saldoPendiente = Math.max(0, cliente?.saldoPendiente - dto.monto);
    if (cliente.bloqueado && cliente?.saldoPendiente <= cliente?.limiteCredito) {
      cliente.bloqueado = false;
    }
    await this.clienteRepo.save(cliente);

    // Registrar transacción contable
    await this.txRepo.save(
      this.txRepo.create({
        id: uuid(),
        usuarioId: usuarioId,
        tipo: 'ingreso',
        categoria: 'pago_recibido',
        monto: dto.monto,
        referenciaId: pago.id,
        referenciaTipo: 'pagos',
        descripcion: `Pago recibido de ${cliente?.nombreNegocio}`,
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
