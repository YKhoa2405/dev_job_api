import { IsArray, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: 'name khong duoc de trong' })
    name: string;

    @IsNotEmpty({ message: 'description khong duoc de trong' })
    description: string;

    @IsNotEmpty({ message: 'permissions khong duoc de trong' })
    @IsMongoId({ each: true })
    @IsArray({ message: 'la mot mang' })
    permissions: mongoose.Schema.Types.ObjectId[];

    @IsNotEmpty({ message: 'isActive khong duoc de trong' })
    isActive: boolean;
}
