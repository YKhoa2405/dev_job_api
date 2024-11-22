// src/service/dto/create-service.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateServiceDto {
  // Tên dịch vụ (bắt buộc)
  @IsString()
  @IsNotEmpty()
  name: string;

  // Mô tả dịch vụ (không bắt buộc)
  @IsString()
  @IsOptional()
  description?: string;

  // Giá dịch vụ (bắt buộc)
  @IsNumber()
  @IsNotEmpty()
  price: number;

  // Thời gian sử dụng dịch vụ, tính theo ngày (không bắt buộc)
  @IsNumber()
  @IsOptional()
  durationDays?: string;

  // Trạng thái dịch vụ (mặc định là `true`)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
