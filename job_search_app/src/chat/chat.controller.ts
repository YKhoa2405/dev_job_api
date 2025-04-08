// src/chat/chat.controller.ts
import { Controller, Get, Post, Query, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { Message } from './schemas/message.schema';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get('messages')
  async getMessages(
    @Query('senderId') senderId: string,
    @Query('recipientId') recipientId: string,
  ): Promise<Message[]> {
    return await this.chatService.getMessages(senderId, recipientId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{ fileUrl: string }> {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    const fileUrl = `http://your-server-url:3000/uploads/${file.filename}`; // Thay bằng logic thực tế
    return { fileUrl };
  }

  @Get('rooms')
  async getChatRooms(@Query('userId') userId: string) {
    return await this.chatService.getChatRooms(userId);

  }
}