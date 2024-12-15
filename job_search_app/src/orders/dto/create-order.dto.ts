import { IsBoolean, IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateOrderDto {
    @IsNotEmpty()
    serviceId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    companyId: mongoose.Schema.Types.ObjectId;

    @IsString()
    amount:number

    @IsOptional()
    @IsDateString()
    endDate?: Date;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;
}
