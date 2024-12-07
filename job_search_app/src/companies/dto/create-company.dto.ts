import { IsString, IsUrl, IsInt, IsOptional, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsNotEmpty()
  userId: mongoose.Schema.Types.ObjectId

  @IsString()
  slogan: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  avatar: string

  @IsUrl()
  website: string;

  @IsString()
  field: string;

  @IsString()
  size: string;

  @IsString()
  about: string;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean = false;
}
