import { Controller, Get, Injectable } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from 'src/common/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>


  ) { }


  @Get('bySkills')
  @Public()
  // Tự động chạy vào 12h khuya thứ 7 hàng tuần
  @Cron('0 0 * * 6')
  async handleSendMailBySkills() {
    const subscribers = await this.subscriberModel.find({});
    let jobs = [];

    for (const subscriber of subscribers) {
      const subSkills = subscriber.skills;

      // Fetch jobs matching any of the subscriber's skills and populate company details
      const jobsMatchingSkills = await this.jobModel
        .find({ skills: { $in: subSkills } })
        .populate('companyId', 'name avatar'); // Populate companyId to get name and avatar

      if (jobsMatchingSkills?.length) {
        // Map over the jobs and extract the relevant fields
        const matchingJobs = jobsMatchingSkills.map(item => ({
          name: item.name,
          company: item.companyId.name,  // Access populated company name
          logo: item.companyId.avatar,  // Access populated company avatar
          salary: item.salary.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          skills: item.skills,
          location: item.city
        }));

        // Giới hạn số lượng công việc (tối đa 10 công việc)
        const limitedJobs = matchingJobs.slice(0, 10); // Chỉ lấy 10 công việc đầu tiên

        // Add the matching jobs to the jobs array
        jobs = [...jobs, ...limitedJobs];

        // Send an email to the subscriber with the jobs
        await this.mailerService.sendMail({
          to: subscriber.email, // Use subscriber's email
          from: '"DevJob" <devjob@gmail.com>', // Sender's email address
          subject: 'Thông báo việc làm phù hợp với kỹ năng của bạn', // Email subject
          template: 'sendEmailBySkills', // Template name
          context: {
            receiver: subscriber.name,  // Subscriber's name
            jobs: matchingJobs,  // Send only the jobs matching the subscriber's skills
            countJobs: jobsMatchingSkills?.length  // Number of matching jobs
          }
        });
      }
    }
  }



}
