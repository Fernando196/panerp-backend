import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';
import { Rol } from '../usuarios/entitties/rol.entity';
import { CategoriasMP } from './entitites/catalogo-mp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rol,CategoriasMP])],
  controllers: [CatalogosController],
  providers: [CatalogosService],
  exports: [CatalogosService],
})
export class CatalogosModule {}
