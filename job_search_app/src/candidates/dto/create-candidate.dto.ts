import { IsEmail, IsOptional, IsString, IsArray, IsIn } from 'class-validator';
import mongoose from 'mongoose';

export class CreateCandidateDto {

    userId: mongoose.Schema.Types.ObjectId

    avatar?: string;

    @IsString()
    fullName: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsArray()
    skills?: string[];

    @IsOptional()
    @IsString()
    level?: string;

    @IsOptional()
    @IsString()
    salary?: string;

    @IsOptional()
    @IsString()
    jobType?: string;

    @IsOptional()
    @IsIn(['Ngay lập tức', '1 tuần', '2 tuần', '1 tháng', null])
    availability?: string;
}