import { Controller, Get } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Public } from 'src/common/decorator/customize';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: Model<SubscriberDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>
  ) {}

  // Hàm gửi email chung (được tái sử dụng)
  async sendJobEmail(subscribers: SubscriberDocument[]) {
    const allJobs = await this.jobModel.find({}).populate('companyId', 'name avatar');

    for (const subscriber of subscribers) {
      const subSkills = subscriber.skills;
      const matchingJobs = allJobs
        .filter(job => job.skills.some(skill => subSkills.includes(skill)))
        .map(item => ({
          name: item.name,
          company: item.companyId.name,
          logo: item.companyId.avatar
            ? item.companyId.avatar.startsWith('http')
              ? item.companyId.avatar
              : `https://yourdomain.com${item.companyId.avatar}`
            : 'https://via.placeholder.com/60',
          salary: item.salary.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          skills: item.skills,
          location: item.city,
        }))
        .slice(0, 5); // Giới hạn 5 công việc

      if (matchingJobs.length > 0) {
        await this.mailerService.sendMail({
          to: subscriber.email,
          from: '"DevJob" <devjob@gmail.com>',
          subject: 'Thông báo việc làm phù hợp với kỹ năng của bạn',
          template: 'sendEmailBySkills',
          context: {
            receiver: subscriber.name,
            jobs: matchingJobs,
            countJobs: matchingJobs.length,
          },
        });
      }
    }
  }

  // Mỗi ngày lúc 8:00 AM
  @Cron('0 8 * * *') // 8:00 sáng mỗi ngày
  @Public()
  async handleDailyEmails() {
    const subscribers = await this.subscriberModel.find({ notificationSchedule: 'daily' });
    if (subscribers.length > 0) {
      await this.sendJobEmail(subscribers);
    }
  }

  // Thứ 4 hàng tuần lúc 8:00 AM
  @Cron('0 8 * * 3') // 8:00 sáng thứ 4 (0 = Chủ nhật, 3 = Thứ 4)
  @Public()
  async handleWednesdayEmails() {
    const subscribers = await this.subscriberModel.find({ notificationSchedule: 'wednesday' });
    if (subscribers.length > 0) {
      await this.sendJobEmail(subscribers);
    }
  }

  // Thứ 7 hàng tuần lúc 8:00 AM
  @Cron('0 8 * * 6') // 8:00 sáng thứ 7 (6 = Thứ 7)
  @Public()
  async handleSaturdayEmails() {
    const subscribers = await this.subscriberModel.find({ notificationSchedule: 'saturday' });
    if (subscribers.length > 0) {
      await this.sendJobEmail(subscribers);
    }
  }

  // API để kiểm tra thủ công (tùy chọn)
  @Get('test')
  @Public()
  async testSendMail() {
    const subscribers = await this.subscriberModel.find({});
    await this.sendJobEmail(subscribers);
    return { message: 'Email sent successfully' };
  }
}