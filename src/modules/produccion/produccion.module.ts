import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduccionService } from './produccion.service';
import { OrdenProduccion } from './entitties/orden-produccion.entity';
import { Receta } from '../recetas/entitties/receta.entity';
import { IngredienteReceta } from '../recetas/entitties/ingrediente-receta.entity';
import { LoteProducto } from '../productos/entitties/lote-producto.entity';
import { InventarioModule } from '../inventario/inventario.module';
import { ProduccionController } from './produccion.controller';

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
