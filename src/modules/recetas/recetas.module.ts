import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetasService } from './recetas.service';
import { Receta } from './entitties/receta.entity';
import { IngredienteReceta } from './entitties/ingrediente-receta.entity';
import { PasoReceta } from './entitties/paso-receta.entity';
import { InventarioModule } from '../inventario/inventario.module';
import { RecetasController } from './recetas.controller';

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
