import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true })
  companyId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true })
  serviceId: string;

  @Prop()
  amount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: null })
  remainingUses: number;

  @Prop({ required: true, unique: true })
  code: string; // Mã định danh duy nhất, ví dụ: "30_JOB_PACKAGE"

  @Prop({ type: Object, required: true })
  createBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updateBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ default: true })
  isActive: boolean
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Thêm index để tối ưu truy vấn
OrderSchema.index({ companyId: 1, createdAt: -1 });
OrderSchema.index({ serviceId: 1 });
OrderSchema.index({ status: 1 });