import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  userId: string; // ID người nhận thông báo

  @Prop({ required: true })
  type: string; // Loại thông báo

  @Prop({ default: false })
  title: string;

  @Prop({ required: true })
  message: string; // Nội dung chính của thông báo

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ default: false })
  isRead: boolean; // Trạng thái đã đọc (cho thông báo hệ thống)

}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Tạo index để tối ưu truy vấn
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });