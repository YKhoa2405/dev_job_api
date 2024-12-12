import { isNotEmpty, IsNotEmpty, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreatePaymentDto {
    @IsNotEmpty()
    companyId: mongoose.Schema.Types.ObjectId;

    @IsString()
    vnp_Amount: string;

    @IsString()
    vnp_BankCode: string;

    @IsOptional()
    @IsString()
    vnp_BankTranNo: string;

    @IsString()
    vnp_CardType: string;

    @IsString()
    vnp_OrderInfo: string;

    @IsString()
    vnp_PayDate: string;

    @IsString()
    vnp_ResponseCode: string;

    @IsString()
    vnp_TmnCode: string;

    @IsString()
    vnp_TransactionNo: string;

    @IsString()
    vnp_TransactionStatus: string;

    @IsString()
    vnp_TxnRef: string;


}
