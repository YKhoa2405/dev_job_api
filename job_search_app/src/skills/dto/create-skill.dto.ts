import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateSkillDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsString()
    @IsOptional()
    category: string; 
  
    @IsNumber()
    @IsOptional()
    @Min(0)
    popularity?: number;

}
