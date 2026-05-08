import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContabilidadController } from '../controllers/contabilidad.controller';
import { ContabilidadService } from '../services/contabilidad.service';
import { CuentaPorCobrar, Pago, Transaccion } from '../../domain/entitites/cuenta-por-cobrar.entity';
import { Cliente } from '../../domain/entitites/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaPorCobrar, Pago, Transaccion, Cliente])],
  controllers: [ContabilidadController],
  providers: [ContabilidadService],
  exports: [ContabilidadService],
})
export class ContabilidadModule {}
