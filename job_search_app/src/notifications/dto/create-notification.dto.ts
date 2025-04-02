import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString()
    userId: string; // ID người nhận thông báo

    @IsNotEmpty()
    @IsString()
    type: string; // Loại thông báo

    @IsOptional()
    @IsString()
    title?: string; // Tiêu đề (tùy chọn)

    @IsNotEmpty()
    @IsString()
    message: string; // Nội dung chính của thông báo

    @IsOptional()
    @Type(() => Boolean)
    isRead?: boolean = false;
}
