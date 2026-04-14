import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationModule } from './notification/notification.module';
import { validate } from 'class-validator';
import { FileModule } from './file/file.module';
import { MailModule } from './mail/mail.module';
import { ShareModule } from './share/share.module';
import { GroupModule } from './group/group.module';
@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    MailModule,
    FileModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [`nats://${process.env.NATS_DNS}:${process.env.NATS_PORT}`],
        },
      },
    ]),
    NotificationModule,
    ShareModule,
    GroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
