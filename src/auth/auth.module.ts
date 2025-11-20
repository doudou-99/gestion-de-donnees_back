import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';
import { ProviderService } from './provider/provider.service';
import { GoogleStrategy } from './google/google.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UserModule,
    MailModule,
    PassportModule.register({defaultStrategy: "google"}),
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ProviderService, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
