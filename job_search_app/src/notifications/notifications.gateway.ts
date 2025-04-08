import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationDocument } from './schemas/notification.schema';

@WebSocketGateway(8000, { namespace: '/notificationsocket', cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(userId);
      this.logger.log(`User ${userId} connected to /notificationsocket with socket ID: ${client.id}`);
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    client.leave(userId);
    this.logger.log(`User ${userId} disconnected from /notificationsocket`);
  }

  async sendNotification(userId: string, notification: Partial<NotificationDocument>) {
    const payload = {
      id: notification._id || null, // ID sẽ có sau khi lưu DB
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      isRead: notification.isRead || false,
    };
    this.server.to(userId).emit('notification', payload);
    this.logger.log(`Sent notification to user ${userId}: ${notification.title}`);
  }

  async broadcastNotification(userIds: string[], notificationData: Omit<NotificationDocument, 'userId' | '_id'>) {
    const payload = {
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      isRead: notificationData.isRead || false,
      createdAt: new Date(),
    };

    // Gửi thông báo qua WebSocket trước
    for (const userId of userIds) {
      this.server.to(userId).emit('notification', { ...payload, userId });
      this.logger.log(`Sent notification to user ${userId}: ${notificationData.title}`);
    }

    // Lưu vào DB sau
    // const notifications = await this.notificationsService.notificationModel.insertMany(
    //   userIds.map(userId => ({ ...notificationData, userId })),
    //   { ordered: false }, // Không cần thứ tự để tăng tốc
    // );

    // (Tùy chọn) Gửi lại ID sau khi lưu nếu cần
    // for (const notification of notifications) {
    //   this.server.to(notification.userId).emit('notification-update', { id: notification._id });
    // }

    // return notifications;
  }
}