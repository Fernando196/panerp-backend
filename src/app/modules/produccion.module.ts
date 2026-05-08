import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduccionController } from '../controllers/produccion.controller';
import { ProduccionService } from '../services/produccion.service';
import { OrdenProduccion } from './entities/orden-produccion.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { IngredienteReceta } from '../recetas/entities/ingrediente-receta.entity';
import { LoteProducto } from '../productos/entities/lote-producto.entity';
import { InventarioModule } from './inventario/inventario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdenProduccion, Receta, IngredienteReceta, LoteProducto]),
    InventarioModule,
  ],
  controllers: [ProduccionController],
  providers: [ProduccionService],
  exports: [ProduccionService],
})
export class ProduccionModule {}
