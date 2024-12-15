import { isNotEmpty, IsNotEmpty, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreatePaymentDto {
    @IsNotEmpty()
    companyId: mongoose.Schema.Types.ObjectId;

    @IsString()
    vnp_Amount: string;

    @IsOptional()
    @IsString()
    vnp_BankCode: string;

    @IsOptional()
    @IsString()
    vnp_BankTranNo: string;

    @IsOptional()
    @IsString()
    vnp_CardType: string;

    @IsOptional()
    @IsString()
    vnp_OrderInfo: string;

    @IsOptional()
    @IsString()
    vnp_PayDate: string;

    @IsOptional()
    @IsString()
    vnp_ResponseCode: string;

    @IsOptional()
    @IsString()
    vnp_TmnCode: string;

    @IsOptional()
    @IsString()
    vnp_TransactionNo: string;

    @IsOptional()
    @IsString()
    vnp_TransactionStatus: string;

    @IsOptional()
    @IsString()
    vnp_TxnRef: string;


}
