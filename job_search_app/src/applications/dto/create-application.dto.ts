import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { ApplicationStatus } from '../schemas/application.schema';
import mongoose from 'mongoose';


export class CreateApplicationDto {

    @IsNotEmpty()
    jobId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    companyId: mongoose.Schema.Types.ObjectId

    userId: mongoose.Schema.Types.ObjectId

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    status?: ApplicationStatus; // Optional, defaults to Pending in schema

    @IsNotEmpty()
    cv: string
}
