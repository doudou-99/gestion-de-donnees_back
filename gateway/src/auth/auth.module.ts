import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationModule } from '../notification/notification.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    MailModule,
    NotificationModule,
    JwtModule.register({
      global: true,
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
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
