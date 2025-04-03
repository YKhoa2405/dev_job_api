import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { Skill, SkillSchema } from 'src/skills/schemas/skill.schema';
import { Application, ApplicationSchema } from 'src/applications/schemas/application.schema';
import { Order, OrderSchema } from 'src/orders/schemas/order.schema';
import { Candidate, CandidateSchema } from 'src/candidates/schemas/candidate.schema';
import { Notification, NotificationSchema } from 'src/notifications/schemas/notification.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CandidatesModule } from 'src/candidates/candidates.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    MongooseModule.forFeature([{ name: Skill.name, schema: SkillSchema }]),
    MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: Candidate.name, schema: CandidateSchema }]),
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    NotificationsModule,
    CandidatesModule,  
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService ]
})
export class JobsModule { }
