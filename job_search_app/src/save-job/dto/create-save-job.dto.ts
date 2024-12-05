import { IsMongoId, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateSaveJobDto {

  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  jobId: string; 

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean; // Tùy chọn, để đánh dấu công việc là yêu thích (mặc định là false)
}