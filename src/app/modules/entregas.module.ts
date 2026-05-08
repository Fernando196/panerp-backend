import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntregasController } from '../controllers/entregas.controller';
import { EntregasService } from '../services/entregas.service';
import { Entrega } from './entities/entrega.entity';
import { DetalleEntrega } from './entities/detalle-entrega.entity';
import { Devolucion } from './entities/devolucion.entity';
import { DetalleDevolucion } from './entities/detalle-devolucion.entity';
import { Reutilizacion } from './entities/reutilizacion.entity';
import { LoteProducto } from '../productos/entities/lote-producto.entity';
import { Cliente } from '../../domain/entitites/cliente.entity';
import { CuentaPorCobrar } from '../../domain/entitites/cuenta-por-cobrar.entity';
import { Transaccion } from '../contabilidad/entities/transaccion.entity';

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
