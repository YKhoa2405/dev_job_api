import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type FollowDocument = HydratedDocument<Follow>;

@Schema({ timestamps: true })
export class Follow {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Schema.Types.ObjectId;  // Lưu ID người dùng, với mối quan hệ User

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true })
  companyId: mongoose.Schema.Types.ObjectId;  // Lưu ID công ty, với mối quan hệ Company
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

// Tạo chỉ mục kết hợp trên userId và companyId để tránh duplicate follow
FollowSchema.index({ userId: 1, companyId: 1 }, { unique: true });
