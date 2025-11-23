import {
    BadRequestException,
    Body,
  Controller,
  HttpCode,
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
