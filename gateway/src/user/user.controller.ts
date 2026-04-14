import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenGuard } from '../auth/guard/access.token.guard';
import { UserEmailResponse } from './response/user.email.response';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards()
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number): Promise<
    ResponseMessageWithData<{
      user: User;
    }>
  > {
    const user = await this.userService.getById(id);
    return {
      data: { user },
      message: 'Get user',
    };
  }

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
