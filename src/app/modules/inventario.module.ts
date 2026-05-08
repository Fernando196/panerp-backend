import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioController } from '../../controllers/inventario.controller';
import { InventarioService } from '../../services/inventario.service';
import { MateriaPrima } from './entities/materia-prima.entity';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { ConversionUnidad } from './entities/conversion-unidad.entity';
import { NotificacionesModule } from '../notificaciones.module';

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
