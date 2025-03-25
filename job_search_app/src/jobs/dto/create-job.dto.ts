import { IsString, IsNotEmpty, IsInt, IsLatitude, IsLongitude, IsArray, IsOptional, IsDate, Min, ValidateNested, IsNotEmptyObject, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';
import { JobLevel, JobType } from '../schemas/job.schema';




export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDate()
    @Type(() => Date) // Chuyển đổi chuỗi thành Date
    @IsNotEmpty()
    startDate: Date;

    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    endDate: Date;

    @IsNotEmpty()
    companyId: mongoose.Schema.Types.ObjectId

    @IsString()
    description?: string;

    @IsString()
    requirement?: string;

    @IsString()
    @IsOptional()
    prioritize?: string;

    @IsArray()
    @IsString({ each: true })
    skills?: string[];

    @IsString()
    location?: string;
    @IsString()
    city?: string;

    @IsString()
    salary?: string;

    @IsInt()
    @Min(1)
    quantity?: number;

    @IsEnum(JobLevel)
    @IsNotEmpty()
    level?: string;

    @IsLatitude()
    @IsOptional()
    latitude?: number;

    @IsLongitude()
    @IsOptional()
    longitude?: number;

    @IsEnum(JobType)
    @IsNotEmpty()
    jobType: JobType;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;

    @IsBoolean()
    @IsOptional()
    isUrgent?: boolean;

    @IsNumber()
    @IsOptional()
    urgentDays?: number;
    
}
