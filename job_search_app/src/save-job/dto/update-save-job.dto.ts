import { PartialType } from '@nestjs/swagger';
import { CreateSaveJobDto } from './create-save-job.dto';

export class UpdateSaveJobDto extends PartialType(CreateSaveJobDto) {}
