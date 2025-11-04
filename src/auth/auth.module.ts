import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    MailModule,
    JwtModule.register({
      global: true,
    }),
    ConfigModule.forRoot()
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
