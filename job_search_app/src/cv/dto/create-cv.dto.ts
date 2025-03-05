import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateCvDto {
    userId: mongoose.Schema.Types.ObjectId

    @IsString()
    @IsNotEmpty()
    name: string;

    url: string;

    @IsOptional()
    processedText: string;

    @IsOptional()
    @IsBoolean()
    isPrimary?: boolean;

}
