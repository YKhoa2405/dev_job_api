
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsBoolean, IsInt, IsOptional, IsUrl } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company {
  @Prop({ unique: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop()
  slogan: string

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  @IsOptional()
  avatar: string

  @Prop()
  @IsOptional()
  follow: number

  @Prop()
  @IsUrl()
  @Prop({ unique: true })
  website: string

  @Prop()
  field: string

  @Prop()
  followers: number

  @Prop()
  size: string

  @Prop()
  about: string

  @Prop({ default: true })
  isApproved: boolean

  @Prop({ type: Object })
  createBy: {
    _id: mongoose.Schema.Types.ObjectId
    email: string
  }
  @Prop({ type: Object })
  updateBy: {
    _id: mongoose.Schema.Types.ObjectId
    email: string
  }
  @Prop({ type: Object })
  deleteBy: {
    _id: mongoose.Schema.Types.ObjectId
    email: string
  }

  // Tài liệu xác minh công ty
  @Prop()
  @IsOptional()
  @IsUrl()
  businessLicenseUrl: string; // Giấy phép đăng ký kinh doanh

  @Prop()
  @IsOptional()
  @IsUrl()
  taxCertificateUrl: string; // Chứng nhận đăng ký thuế

  @Prop()
  @IsOptional()
  @IsUrl()
  companyEstablishmentDecisionUrl: string; // Quyết định thành lập công ty

  @Prop()
  isDeleted: boolean
  @Prop()
  deletedAt: Date
}

export const CompanySchema = SchemaFactory.createForClass(Company);
