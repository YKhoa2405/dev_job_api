// src/chat/schemas/message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  _id?: string;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  recipientId: string;

  @Prop({ required: false, default: '' })
  message: string;

  @Prop({ default: null })
  fileUrl: string;

  @Prop({ default: Date.now })
  timestamp: Date;
  
  @Prop({ default: false }) // Thêm trường isRead, mặc định là false
  isRead: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);