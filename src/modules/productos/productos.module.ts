import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { ProductoTerminado } from './entitties/producto-terminado.entity';
import { LoteProducto } from './entitties/lote-producto.entity';
import { ProductosController } from './productos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoTerminado, LoteProducto])],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}
