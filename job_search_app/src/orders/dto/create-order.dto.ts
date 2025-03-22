import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateOrderDto {
  @IsMongoId()
  serviceId: mongoose.Schema.Types.ObjectId;

  @IsMongoId()
  companyId: mongoose.Schema.Types.ObjectId;

  amount: number;

  startDate: Date;

  endDate: Date;

  @IsOptional()
  @IsNumber()
  remainingUses?: number;
}