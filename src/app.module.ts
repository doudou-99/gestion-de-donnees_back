import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './file/file.module';
import { validate } from './env.validation';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, MailModule, ConfigModule.forRoot({
    isGlobal: true,
    validate
  }), FileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
