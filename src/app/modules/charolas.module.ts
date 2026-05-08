import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharolasController } from '../controllers/charolas.controller';
import { CharolasService } from '../services/charolas.service';
import { Charola } from '../../domain/entitites/charola.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Charola])],
  controllers: [CharolasController],
  providers: [CharolasService],
  exports: [CharolasService],
})
export class CharolasModule {}
