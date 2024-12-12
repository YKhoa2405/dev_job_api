import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true }) // Tự động thêm createdAt và updatedAt
export class Payment {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
    companyId: string;

    @Prop()
    vnp_Amount: string;

    @Prop()
    vnp_BankCode: string

    @Prop()
    vnp_BankTranNo: string

    @Prop()
    vnp_CardType: string;

    @Prop()
    vnp_OrderInfo: string;

    @Prop()
    vnp_PayDate: string;

    @Prop()
    vnp_ResponseCode: string

    @Prop()
    vnp_TmnCode: string

    @Prop()
    vnp_TransactionNo: string

    @Prop()
    vnp_TransactionStatus: string;

    @Prop()
    vnp_TxnRef: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
