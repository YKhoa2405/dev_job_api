import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends OmitType(CreateUserDto, ['password'] as const) {
    @IsOptional()
    email: string

    @IsOptional()
    password: string

    @IsOptional()
    avatar: string
}
