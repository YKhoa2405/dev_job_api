import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
    companyId: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Service' })
    serviceId: string;

    @Prop()
    amount: number

    @Prop()
    endDate: Date;

    @Prop()
    isActive: boolean

    @Prop({ type: Object })
    createBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string;
    }
}

export const OrderSchema = SchemaFactory.createForClass(Order);
