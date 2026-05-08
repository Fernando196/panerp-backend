import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContabilidadService } from './contabilidad.service';
import { Cliente } from '../clientes/entitties/cliente.entity';
import { ContabilidadController } from './contabilidad.controller';
import { CuentaPorCobrar } from './entitties/cuenta-por-cobrar.entity';
import { Pago } from './entitties/pago.entity';
import { Transaccion } from './entitties/transaccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaPorCobrar, Pago, Transaccion, Cliente])],
  controllers: [ContabilidadController],
  providers: [ContabilidadService],
  exports: [ContabilidadService],
})
export class ContabilidadModule {}
