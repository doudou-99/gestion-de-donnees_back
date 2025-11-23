import {
    BadRequestException,
    Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SharesCreateDto } from './dto/shares.create.dto';
import { ShareService } from './share.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { ShareCreateResponse } from './response/share.create.response';
import { AccessTokenGuard } from '../auth/guard/access.token.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import type { RequestPayload } from '../auth/interface/payload.interface';
import { ShareAccessResponse } from './response/share.access.response';
import { AccessShareDto } from './dto/access.share.dto';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';
import { FileService } from '../file/file.service';
import { TypeNotification } from '../notification/enums/EnumTypeNotification';
import { TypeChannel } from '../notification/enums/EnumTypeChannel';
import { TypeRecipient } from '../notification/enums/EnumTypeRecipient';
import { CreateNotificationRequest } from '../notification/dto/create.notification.request';
import { catchError, throwError, timeout } from 'rxjs';

@Controller('api/v1/shares')
@UseGuards(AccessTokenGuard)
export class ShareController {
  constructor(private readonly shareService: ShareService, private readonly notificationService: NotificationService,
    private fileService: FileService, private readonly userService: UserService, private readonly groupService: GroupService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: ResponseMessageWithData<{
      shares: ShareCreateResponse[];
    }>,
    description: 'Shares of users or groups that have access right to the file',
  })
  @ApiBearerAuth()
  @Post(':idFile')
  async createShares(
    @Param('idFile', ParseIntPipe) id: number,
    @Body() data: SharesCreateDto, 
    @Req() req: RequestPayload
  ): Promise<
    ResponseMessageWithData<{
      shares: ShareCreateResponse[];
    }>
  > {
    if (data.users !== undefined && data.users.includes(req.user.sub)) {
        throw new BadRequestException();
    }
    const shares = await this.shareService.createShares(id, data);

    if (await this.fileService.existsById(id)) {
      const file = await this.fileService.getById(id);
      if (data.users && data.users.length > 0) {
        for (let idUser of data.users) {
          if (await this.userService.existsById(idUser)) {
            const userShare = await this.userService.getById(idUser);
            console.log("🚀 ~ share.controller.ts:69 ~ ShareController ~ createShares ~ userShare:", userShare)
            const notifDto: CreateNotificationRequest = {message: "Share", type: TypeNotification.SHAREFILE, 
                  typeChannel: TypeChannel.EMAIL, recipientId: userShare.id, recipientType: TypeRecipient.USER,
                  metadata: {"recipient":userShare.email, "fileId": file.id, "fileName": file.name}}
            console.log("🚀 ~ share.controller.ts:73 ~ ShareController ~ createShares ~ notifDto:", notifDto)

            this.notificationService.create(notifDto).pipe(
                    timeout(6000),
                    catchError((error) => {
                      console.error(`Error creating notification: ${error.message}`);
                      return throwError(() =>
                        new HttpException(
                          error.message || 'Failed to create notification',
                          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                        ),
                      );
                    }),
                  ).subscribe()
          }
        }   
      }
      if (data.groups && data.groups.length > 0) {
        for (let idGroup of data.groups) {
          if (await this.groupService.existsById(idGroup)) {
            const groupShare = await this.groupService.getById(idGroup);
            const groupLeader = await this.userService.getById(groupShare.leaderId);
            const notifDto: CreateNotificationRequest = {message: "Share", type: TypeNotification.SHAREFILE, 
                  typeChannel: TypeChannel.EMAIL, recipientId: groupLeader.id, recipientType: TypeRecipient.GROUP,
                  metadata: {"recipient":groupLeader.email, "fileId": file.id, "fileName": file.name}}
            this.notificationService.create(notifDto).pipe(
                    timeout(6000),
                    catchError((error) => {
                      console.error(`Error creating notification: ${error.message}`);
                      return throwError(() =>
                        new HttpException(
                          error.message || 'Failed to create notification',
                          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                        ),
                      );
                    }),
                  ).subscribe()
          }
        }   
      }
    }
    
    return {
      data: { shares },
      message: 'Shares of users or groups that have access right to the file',
    };
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      share: ShareAccessResponse;
    }>,
    description: 'User that have access right to the file',
  })
  @ApiBearerAuth()
  @Patch(':idFile/access/user/:idUser')
  async editAccessTypeShareUser(
    @Param('idFile', ParseIntPipe) id: number,
    @Param('idUser', ParseIntPipe) idUser: number,
    @Body() data: AccessShareDto
  ): Promise<
    ResponseMessageWithData<{
      share: ShareAccessResponse;
    }>
  > {
    const share = await this.shareService.editAccessFileUser(id, idUser, data);
    return {
      data: { share },
      message: 'User that have access right to the file'
    };
  }
}
