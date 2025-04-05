import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  jobId: mongoose.Schema.Types.ObjectId;

  @Prop()
  reason?: string;

  @Prop()
  selectedCategory?: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ default: 'Chưa phân loại' })
  category: string;


}

export const ReportSchema = SchemaFactory.createForClass(Report);