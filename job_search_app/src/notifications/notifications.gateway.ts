import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationsService: NotificationsService) {}

  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: string) {
    this.server.socketsJoin(userId); // Người dùng tham gia phòng theo userId
  }

  async sendNotification(userId: string, notification: any) {
    // Lưu thông báo vào MongoDB
    await this.notificationsService.create(notification, userId);
    // Gửi thông báo tới người dùng cụ thể qua WebSocket
    this.server.to(userId).emit('notification', notification);
  }
}