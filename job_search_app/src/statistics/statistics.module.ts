import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Job, JobSchema } from 'src/jobs/schemas/job.schema';
import { Application, ApplicationSchema } from 'src/applications/schemas/application.schema';
import { Candidate, CandidateSchema } from 'src/candidates/schemas/candidate.schema';
import { Skill, SkillSchema } from 'src/skills/schemas/skill.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/orders/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: Skill.name, schema: SkillSchema },
      { name: Order.name, schema: OrderSchema },

    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule { }
