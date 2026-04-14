import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SharesCreateDto } from './dto/shares.create.dto';
import { ShareService } from './share.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { ShareCreateResponse } from './response/share.create.response';
import { AccessTokenGuard } from '../auth/guard/access.token.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import type { RequestPayload } from '../auth/interface/payload.interface';
import { ShareAccessUserResponse, ShareAccessGroupResponse } from './response/share.access.response';
import { AccessShareDto } from './dto/access.share.dto';
import { ReceiversResponse } from './response/share.receiver.response';

@Controller('api/v1/shares')
@UseGuards(AccessTokenGuard)
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

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
    @Req() req: RequestPayload,
  ): Promise<
    ResponseMessageWithData<{
      shares: ShareCreateResponse[];
    }>
  > {
    if (data.users !== undefined && data.users.includes(req.user.sub)) {
      throw new BadRequestException();
    }
    const shares = await this.shareService.createShares(id, req.user.sub, data);
    return {
      data: { shares },
      message: 'Shares of users or groups that have access right to the file',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      share: ShareAccessUserResponse;
    }>,
    description: 'User that have access right to the file',
  })
  @ApiBearerAuth()
  @Patch(':idFile/access/user/:idUser')
  async editAccessTypeShareUser(
    @Param('idFile', ParseIntPipe) id: number,
    @Param('idUser', ParseIntPipe) idUser: number,
    @Body() data: AccessShareDto,
  ): Promise<
    ResponseMessageWithData<{
      share: ShareAccessUserResponse;
    }>
  > {
    const share = await this.shareService.editAccessFileUser(id, idUser, data);
    return {
      data: { share },
      message: 'User that have access right to the file',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      share: ShareAccessGroupResponse;
    }>,
    description: 'Change access type of the group that have access right to the file',
  })
  @ApiBearerAuth()
  @Patch(':idFile/access/group/:idGroup')
  async editAccessTypeShareGroup(
    @Param('idFile', ParseIntPipe) id: number,
    @Param('idGroup', ParseIntPipe) idGroup: number,
    @Body() data: AccessShareDto,
  ): Promise<
    ResponseMessageWithData<{
      share: ShareAccessGroupResponse;
    }>
  > {
    const share = await this.shareService.editAccessFileGroup(id, idGroup, data);
    return {
      data: { share },
      message: 'Change of the access type of the group that have access right to the file completed successfully',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      receivers: ReceiversResponse;
    }>,
    description: 'Users and groups list',
  })
  @ApiBearerAuth()
  @Get('receivers')
  async getReceivers(@Req() req: RequestPayload): Promise<
    ResponseMessageWithData<{
      receivers: ReceiversResponse;
    }>
  > {
    const receivers = await this.shareService.getReceivers(req.user.sub);
    console.log('🚀 ~ share.controller.ts:124 ~ ShareController ~ getReceivers ~ receivers:', receivers);

    return {
      data: { receivers },
      message: 'Users and groups list',
    };
  }
}
