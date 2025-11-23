import { Module } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { NotificationModule } from '../notification/notification.module';
import { GroupModule } from '../group/group.module';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [NotificationModule, GroupModule, UserModule, FileModule,  ClientsModule.register([
        {
          name: 'NATS_SERVICE',
          transport: Transport.NATS,
          options: {
            servers: [`nats://${process.env.NATS_DNS}:${process.env.NATS_PORT}`],
          },
        },
  
      ]),],
  providers: [ShareService],
  controllers: [ShareController],
})
export class ShareModule {}
