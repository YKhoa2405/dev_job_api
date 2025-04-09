// src/chat/chat.controller.ts
import { Controller, Get, Post, Query, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { Message } from './schemas/message.schema';
import { FilesService } from 'src/files/files.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly filesService: FilesService) { }

  @Get('messages')
  async getMessages(
    @Query('senderId') senderId: string,
    @Query('recipientId') recipientId: string,
  ): Promise<Message[]> {
    return await this.chatService.getMessages(senderId, recipientId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File
  ): Promise<{ fileUrl: string }> {
    try {
      const fileName = `chat/${Date.now()}_${file.originalname}`;
      const fileUrl = await this.filesService.uploadFile(file); // Gọi hàm từ FilesService
      return { fileUrl };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to upload file', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('rooms')
  async getChatRooms(@Query('userId') userId: string) {
    return await this.chatService.getChatRooms(userId);

  }
}