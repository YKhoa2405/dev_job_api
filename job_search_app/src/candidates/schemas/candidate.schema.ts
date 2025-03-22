import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type CandidateDocument = HydratedDocument<Candidate>;

@Schema({ timestamps: true })
export class Candidate {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: User;

    @Prop({ required: false, trim: true })
    fullName: string;

    @Prop()
    @IsOptional()
    avatar: string;

    @Prop({ required: false, trim: true })
    phone: string; // Số điện thoại

    @Prop({ required: true, unique: true, trim: true, lowercase: true })
    email: string; // Email

    @Prop({ required: false, trim: true })
    location: string; // Địa điểm

    @Prop({ type: [String], default: [], index: true })
    skills: string[]; // Mảng kỹ năng

    @Prop({ required: false })
    level: string;

    @Prop({ required: false })
    salary: string;

    @Prop({ required: false })
    jobType: string;

    @Prop({
        required: false,
        enum: ['Ngay lập tức', '1 tuần', '2 tuần', '1 tháng', null]
    })
    availability: string; // Trạng thái sẵn sàng

    @Prop({ type: Date, default: Date.now })
    createdAt: Date; // Thời gian tạo

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date; // Thời gian cập nhật
}

// Tạo schema từ class
export const CandidateSchema = SchemaFactory.createForClass(Candidate);

// Thêm chỉ mục để tối ưu tìm kiếm
CandidateSchema.index({ email: 1 }, { unique: true });
CandidateSchema.index({ location: 1 });
CandidateSchema.index({ skills: 1 });
CandidateSchema.index({ experienceYears: 1 });