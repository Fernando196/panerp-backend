import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificacionesService } from './notificaciones.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'notificaciones' })
export class NotificacionesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(private readonly notifService: NotificacionesService) {}

  handleConnection(client: Socket) {
    const usuarioId = client.handshake.query.usuarioId as string;
    if (usuarioId) client.join(`usuario_${usuarioId}`);
  }

  handleDisconnect(client: Socket) {
    client.disconnect();
  }

  @SubscribeMessage('mis_notificaciones')
  async misNotificaciones(client: Socket, data: { usuarioId: string }) {
    const notifs = await this.notifService.findByUsuario(data.usuarioId, true);
    client.emit('notificaciones', notifs);
  }

  emitirAUsuario(usuarioId: string, evento: string, data: any) {
    this.server.to(`usuario_${usuarioId}`).emit(evento, data);
  }

  emitirATodos(evento: string, data: any) {
    this.server.emit(evento, data);
  }
}
