import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateCvDto {
    // @IsNotEmpty()
    userId: mongoose.Schema.Types.ObjectId

    // @IsString()
    // @IsNotEmpty()
    name: string;

    // @IsString()
    // @IsNotEmpty()
    url: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];

    @IsOptional()
    // @IsString()
    city:string

    @IsOptional()
    // @IsString()
    experience:string

}
