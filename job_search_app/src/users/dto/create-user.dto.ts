import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from "class-validator"

export class CreateUserDto {
    @IsEmail({}, { message: 'Email không đúng định dạng', })
    @IsOptional()
    email: string

    @IsOptional()
    password: string

    @IsString()
    @IsOptional()
    avatar?: string

    @IsOptional()
    name: string

    // @IsMongoId({ message: 'role phai la id' })
    @IsString()
    @IsNotEmpty()
    role: string
}
