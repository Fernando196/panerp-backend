import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntregasService } from './entregas.service';
import { Cliente } from '../clientes/entitties/cliente.entity';
import { CuentaPorCobrar } from '../contabilidad/entitties/cuenta-por-cobrar.entity';
import { Entrega } from './entitties/entrega.entity';
import { DetalleEntrega } from './entitties/detalle-entrega.entity';
import { Devolucion } from './entitties/devolucion.entity';
import { DetalleDevolucion } from './entitties/detalle-devolucion.entity';
import { Reutilizacion } from './entitties/reutilizacion.entity';
import { LoteProducto } from '../productos/entitties/lote-producto.entity';
import { Transaccion } from '../contabilidad/entitties/transaccion.entity';
import { EntregasController } from './entregas.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Entrega, DetalleEntrega, Devolucion, DetalleDevolucion,
      Reutilizacion, LoteProducto, Cliente, CuentaPorCobrar, Transaccion,
    ]),
  ],
  controllers: [EntregasController],
  providers: [EntregasService],
  exports: [EntregasService],
})
export class EntregasModule {}
