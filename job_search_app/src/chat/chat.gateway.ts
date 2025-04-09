// src/chat/chat.gateway.ts
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) { }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { senderId: string; recipientId: string; message: string; fileUrl?: string; tempId?: string }) {
    console.log("Received payload:", payload);
    const { senderId, recipientId, message, fileUrl, tempId } = payload;

    try {
      const savedMessage = await this.chatService.saveMessage(senderId, recipientId, message, fileUrl);
      console.log("Saved message:", savedMessage);

      const messageData = {
        senderId,
        message,
        fileUrl,
        timestamp: savedMessage.timestamp,
        _id: savedMessage._id,
        isRead: savedMessage.isRead,
        tempId,
      };

      this.server.to(recipientId).emit('receiveMessage', messageData);
      client.emit('receiveMessage', messageData);
    } catch (error) {
      console.log("Error saving message:", error);
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, payload: { senderId: string; recipientId: string }) {
    const { senderId, recipientId } = payload;

    try {
      // Đánh dấu tin nhắn từ senderId gửi đến recipientId là đã đọc
      await this.chatService.getMessages(senderId, recipientId);

      // Thông báo qua WebSocket cho cả hai phía
      const updatedMessages = await this.chatService.getMessages(senderId, recipientId);
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      const participantInfo = await this.chatService.getParticipantInfo(recipientId);

      const updateData = {
        senderId,
        recipientId,
        lastMessage: {
          text: lastMessage.message,
          timestamp: lastMessage.timestamp,
          senderId: lastMessage.senderId,
          fileUrl: lastMessage.fileUrl || null,
          isRead: lastMessage.isRead,
        },
        participant: participantInfo,
      };

      this.server.to(senderId).emit('messageRead', updateData);
      this.server.to(recipientId).emit('messageRead', updateData);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }
}