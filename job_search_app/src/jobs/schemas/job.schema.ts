import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsInt, IsLatitude, IsLongitude } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schema';

export type JobDocument = HydratedDocument<Job>;

export enum JobType {
    OFFICE = 'Office',
    REMOTE = 'Remote',
    HYBRID = 'Hibrid'
}

export enum JobLevel {
    INTERN = 'Intern',
    FRESHER = 'Fresher',
    JUNIOR = 'Junior',
    MIDDLE = 'Middle',
    SENIOR = 'Senior',
    LEAD = 'Trưởng nhóm',
    MANAGER = 'Trưởng phòng',
    DIRECTOR = 'Director',
}

@Schema({ timestamps: true })
export class Job {
    @Prop()
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
    companyId: Company;

    @Prop()
    startDate: Date;

    @Prop()
    endDate: Date;

    @Prop()
    description: string;

    @Prop()
    requirement: string;

    @Prop()
    prioritize: string;

    @Prop()
    skills: string[];

    @Prop()
    location: string;

    @Prop({ enum: JobType }) // Thêm trường jobType với enum
    @IsEnum(JobType) // Xác nhận rằng giá trị của trường này là một trong những giá trị đã định nghĩa
    jobType: JobType; // Hoặc bạn có thể dùng string nếu không dùng enum

    @Prop()
    city: string;

    @Prop()
    salary: string;

    @Prop()
    @IsInt()
    quantity: number;

    @Prop({ enum: JobLevel }) 
    @IsEnum(JobLevel) 
    level: JobLevel; 

    @Prop()
    @IsLatitude()
    latitude: number;

    @Prop()
    @IsLongitude()
    longitude: number;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Object })
    createBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string;
    }
}

export const JobSchema = SchemaFactory.createForClass(Job);
