import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService]
})
export class FileModule {}
