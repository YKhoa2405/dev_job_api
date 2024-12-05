import { Module } from '@nestjs/common';
import { SaveJobService } from './save-job.service';
import { SaveJobController } from './save-job.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SaveJob, SaveJobSchema } from './schemas/save-job.schema';
import { Job, JobSchema } from 'src/jobs/schemas/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SaveJob.name, schema: SaveJobSchema }]),
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }])
  ],
  controllers: [SaveJobController],
  providers: [SaveJobService],
  exports: [SaveJobService]
})
export class SaveJobModule { }
