import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Notificacion } from './entitties/notificacion.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion) private notifRepo: Repository<Notificacion>,
  ) {}

  async findByUsuario(usuarioId: string, soloNoLeidas = false) {
    const where: any = { usuarioId: usuarioId };
    if (soloNoLeidas) where.leida = false;
    return this.notifRepo.find({ where, order: { createdAt: 'DESC' }, take: 50 });
  }

  async marcarLeida(id: string) {
    await this.notifRepo.update({ id }, { leida: true });
    return { message: 'Notificación marcada como leída' };
  }

  async marcarTodasLeidas(usuarioId: string) {
    await this.notifRepo.update({ usuarioId: usuarioId, leida: false }, { leida: true });
    return { message: 'Todas las notificaciones marcadas como leídas' };
  }

  async crearAlertaStockBajo(mp: any) {
    return this.crear({
      tipo: 'inventario_bajo',
      titulo: 'Stock bajo',
      mensaje: `"${mp.nombre}" tiene ${mp.stock_actual} ${mp.unidad_principal} — por debajo del mínimo (${mp.stock_minimo})`,
    });
  }

  async crearAlertaDeudaVencida(cliente: any, monto: number) {
    return this.crear({
      tipo: 'deuda_vencida',
      titulo: 'Deuda vencida',
      mensaje: `${cliente.nombre_negocio} tiene una deuda vencida de $${monto.toFixed(2)} MXN`,
    });
  }

  async crearAlertaCaducidad(producto: any, lote: any) {
    return this.crear({
      tipo: 'producto_caducando',
      titulo: 'Producto por caducar',
      mensaje: `Lote ${lote.numero_lote} de "${producto.nombre}" caduca el ${lote.fecha_caducidad}`,
    });
  }

  private async crear(data: { tipo: string; titulo: string; mensaje: string; usuarioId?: string }) {
    const notif = this.notifRepo.create({
      id: uuid(),
      usuarioId: data.usuarioId ?? 'broadcast',
      tipo: data.tipo as any,
      titulo: data.titulo,
      mensaje: data.mensaje,
    });
    return this.notifRepo.save(notif);
  }
}
