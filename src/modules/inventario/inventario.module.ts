import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MateriaPrima } from './entitties/materia-prima.entity';
import { MovimientoInventario } from './entitties/movimiento-inventario.entity';
import { ConversionUnidad } from './entitties/conversion-unidad.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MateriaPrima, MovimientoInventario, ConversionUnidad]),
    NotificacionesModule,
  ],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule {}
