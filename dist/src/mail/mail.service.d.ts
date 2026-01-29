import { MailerService } from '@nestjs-modules/mailer';
export declare class MailService {
    private readonly mailerService;
    constructor(mailerService: MailerService);
    sendEmail(recipient: string, sender: string, subject: string, body: string): Promise<void>;
}
