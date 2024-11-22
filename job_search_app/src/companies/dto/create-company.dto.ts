import { IsString, IsUrl, IsInt, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  slogan: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  avatar: string

  @IsUrl()
  website: string;

  @IsString()
  field: string;

  @IsString()
  size: string;

  @IsString()
  about: string;
}
