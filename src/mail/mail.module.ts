import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST,
          port: +process.env.SMTP_PORT,
          secureConnection: false,
          auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
          },
          tls: {
            ciphers:'SSLv3'
          }
        },
        defaults: {
          from: process.env.MAIL_USERNAME
        }
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
