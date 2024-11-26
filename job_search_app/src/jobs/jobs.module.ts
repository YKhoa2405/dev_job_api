import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { Skill, SkillSchema } from 'src/skills/schemas/skill.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    MongooseModule.forFeature([{ name: Skill.name, schema: SkillSchema }])
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule { }
