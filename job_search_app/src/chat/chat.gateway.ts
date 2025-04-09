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
        tempId,
      };

      this.server.to(recipientId).emit('receiveMessage', messageData);
      client.emit('receiveMessage', messageData);
    } catch (error) {
      console.log("Error saving message:", error);
    }
  }
}