import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    recipient: string,
    sender: string,
    subject: string,
    body: string,
  ) {
    await this.mailerService
      .sendMail({
        to: recipient,
        from: sender,
        subject: subject,
        html: body
      })
      .catch((err: any) => console.error(err));
  }
}
