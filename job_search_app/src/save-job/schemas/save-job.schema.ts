import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SaveJobDocument = HydratedDocument<SaveJob>;

@Schema({ timestamps: true })
export class SaveJob {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true })
  jobId: mongoose.Types.ObjectId;

  @Prop({ default: false })
  isFavorite: boolean;
}

export const SaveJobSchema = SchemaFactory.createForClass(SaveJob);
