import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport} from '@nestjs/microservices';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, ConfigModule.forRoot(), ClientsModule.register([
    {
      name: "NATS_SERVICE",
      transport: Transport.NATS,
      options: {
        servers: [`nats://${process.env.NATS_DNS}:${process.env.NATS_PORT}`]
      }
    }
  ]), NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
