import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharolasService } from './charolas.service';
import { Charola } from './entitties/charola.entity';
import { CharolasController } from './charolas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Charola])],
  controllers: [CharolasController],
  providers: [CharolasService],
  exports: [CharolasService],
})
export class CharolasModule {}
