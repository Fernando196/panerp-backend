import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetasController } from '../controllers/recetas.controller';
import { RecetasService } from '../services/recetas.service';
import { Receta } from './entities/receta.entity';
import { IngredienteReceta } from './entities/receta.entity';
import { PasoReceta } from './entities/receta.entity';
import { InventarioModule } from './inventario/inventario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Receta, IngredienteReceta, PasoReceta]),
    InventarioModule,
  ],
  controllers: [RecetasController],
  providers: [RecetasService],
  exports: [RecetasService],
})
export class RecetasModule {}
