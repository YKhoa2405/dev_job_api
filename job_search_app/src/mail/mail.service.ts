import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  // Gửi email xác minh
  async sendVerificationEmail(to: string, name: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: 'nguyenykhoa2405@gmail.com',
      subject: 'Xác minh tài khoản của bạn',
      template: 'sendEmailVerify', // Tên template
      context: {
        receiver: name,
        code: code, // Truyền mã xác minh vào template
      },
    });
  }
}
