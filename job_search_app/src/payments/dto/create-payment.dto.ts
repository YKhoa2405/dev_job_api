import { IsNotEmpty, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreatePaymentDto {
    @IsNotEmpty()
    serviceId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    companyId: mongoose.Schema.Types.ObjectId;

    @IsString()
    vnp_BankCode:string

    @IsString()
    vnp_Amount: string;

    @IsString()
    vnp_PayDate:string;

    @IsString()
    vnp_OrderInfo: string;

    @IsString()
    vnp_TransactionStatus: string;

    @IsString()
    vnp_TxnRef: string;


}
