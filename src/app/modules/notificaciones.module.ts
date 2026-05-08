import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesService } from '../services/notificaciones.service';
import { NotificacionesGateway } from '../gateway/notificaciones.gateway';
import { Notificacion } from './entities/notificacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion])],
  providers: [NotificacionesService, NotificacionesGateway],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
