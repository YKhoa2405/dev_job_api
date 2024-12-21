import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SubscriberDocument = HydratedDocument<Subscriber>;

@Schema({ timestamps: true })
export class Subscriber {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], required: true })  // Định nghĩa `skills` là một mảng chứa chuỗi
  skills: string[];

  @Prop({ type: Object })
  createBy: {
    _id: mongoose.Schema.Types.ObjectId
    email: string
  }
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
