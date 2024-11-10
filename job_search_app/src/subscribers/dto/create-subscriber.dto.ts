import { IsEmail, IsNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;

  @IsNotEmpty({ message: 'Tên là bắt buộc' })
  name: string;

  @IsArray({ message: 'Skills phải là một mảng' })
  @IsNotEmpty({ message: 'Skills là bắt buộc' })
  @IsString({ each: true, message: 'Mỗi skill phải là một chuỗi ký tự' })
  skills: string[];
}
