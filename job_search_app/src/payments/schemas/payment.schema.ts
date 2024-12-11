import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema() // Tự động thêm createdAt và updatedAt
export class Payment {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }) // Liên kết với model Company
    companyId: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Service' })
    serviceId: string;

    @Prop()
    vnp_BankCode: string

    @Prop()
    vnp_Amount: string;

    @Prop()
    vnp_PayDate: string;

    @Prop()
    vnp_OrderInfo: string;

    @Prop()
    vnp_TransactionStatus: string;

    @Prop()
    vnp_TxnRef: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
