// src/chat/chat.gateway.ts
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { senderId: string; recipientId: string; message: string; fileUrl?: string; tempId?: string }) {
    const { senderId, recipientId, message, fileUrl, tempId } = payload;

    const savedMessage = await this.chatService.saveMessage(senderId, recipientId, message, fileUrl);

    const messageData = {
      senderId,
      message,
      fileUrl,
      timestamp: savedMessage.timestamp,
      _id: savedMessage._id,
      tempId, // Gửi lại tempId để client đồng bộ
    };

    this.server.to(recipientId).emit('receiveMessage', messageData);
    client.emit('receiveMessage', messageData); // Gửi lại cho người gửi
  }
}