import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosController } from '../controllers/productos.controller';
import { ProductosService } from '../services/productos.service';
import { ProductoTerminado } from './entities/producto-terminado.entity';
import { LoteProducto } from './entities/producto-terminado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoTerminado, LoteProducto])],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}
