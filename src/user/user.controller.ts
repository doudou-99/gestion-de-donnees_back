import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guard/access.token.guard';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { UserEmailResponse } from './response/user.email.response';

@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      email: UserEmailResponse;
    }>,
  })
  @UseGuards(AccessTokenGuard)
  @Get(':id/email')
  async getEmailById(@Param('id', ParseIntPipe) id: number): Promise<
    ResponseMessageWithData<{
      email: UserEmailResponse;
    }>
  > {
    const email = await this.userService.getEmailById(id);
    return {
      data: { email },
      message: 'Email of user displayed successfully',
    };
  }
}
