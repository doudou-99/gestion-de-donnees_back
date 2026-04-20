import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  PreconditionFailedException,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SigninDTO } from './dto/signin.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { loginInterface } from './interface/logininterface';
import type { RequestPayload } from './interface/payload.interface';
import { RefreshTokenGuard } from './guard/refresh.token.guard';
import { SignupDto } from './dto/signup.dto';
import { User } from '@prisma/client';
import type { Response } from 'express';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserResponse } from './interface/user.response';
import { AccessTokenGuard } from './guard/access.token.guard';
import { ConfirmTokenGuard } from './guard/confirm.token.guard';
import { ResponseMessage } from '../responses/response.message';
import { ConfirmDTO } from './dto/confirm.dto';
import { NotificationService } from '../notification/notification.service';
import { UpsertTokenDto } from './interface/upsert.token.dto';
import { SigninResponse } from './interface/signin.response';
import { RefreshResponse } from './interface/refresh.response';
import { CreateNotificationRequest } from '../notification/dto/create.notification.request';
import { TypeRecipient } from '../notification/enums/EnumTypeRecipient';
import { TypeNotification } from '../notification/enums/EnumTypeNotification';
import { TypeChannel } from '../notification/enums/EnumTypeChannel';

@Controller('api/v1/auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: ResponseMessageWithData<{
      user: UserResponse;
    }>,
  })
  @Post('signup')
  async signUp(@Body() body: SignupDto): Promise<
    ResponseMessageWithData<{
      user: User;
    }>
  > {
    body.password = await this.authService.hash(body.password);
    if (body.extraEmail === undefined || body.extraEmail === '') body.extraEmail = undefined;
    const user = await this.userService.create(body);
    //Confirm token
    const confirm_token = await this.authService.generateConfirmToken(user.id);
    const hashed = await this.authService.hash(confirm_token);
    const upsertDto: UpsertTokenDto = { userId: user.id, token: hashed, type: 'ACTIVATEACCOUNT' };
    await this.authService.upsertToken(upsertDto);
    this.authService.sendConfirmEmail(body.email, confirm_token, user.id);
    return {
      data: { user },
      message: 'The user is created',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseMessage,
  })
  @Post('resend')
  async sendConfirm(@Body() confirmDto: ConfirmDTO): Promise<ResponseMessage> {
    const user = await this.userService.getByEmail(confirmDto.email);
    const confirmToken = await this.authService.generateConfirmToken(user.id);
    const hashed = await this.authService.hash(confirmToken);
    const upsertDto: UpsertTokenDto = { userId: user.id, token: hashed, type: 'ACTIVATEACCOUNT' };
    const tokenDB = await this.authService.findUniqueToken(user.id, 'ACTIVATEACCOUNT');
    if (tokenDB) upsertDto.ancienToken = tokenDB.token;
    await this.authService.upsertToken(upsertDto);
    this.authService.sendConfirmEmail(user.email, confirmToken, user.id);
    return {
      message: 'Confirmation email sent',
    };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ConfirmTokenGuard)
  @ApiOkResponse({ description: 'Account confirmation' })
  @Get('confirm/:token')
  async confirm(@Req() req: RequestPayload, @Param('token') token: string, @Res() res: Response) {
    const tokenDB = await this.authService.findUniqueToken(req.user.sub, 'ACTIVATEACCOUNT');
    if (tokenDB.type !== 'ACTIVATEACCOUNT') return res.redirect(process.env.FRONT_URL + '/signin');
    const compare = await this.authService.compare(tokenDB.token, token);
    if (!compare) return res.redirect(process.env.FRONT_URL + '/signin');
    const user = await this.userService.getById(req.user.sub);
    if (user.status !== 'NOT_CONFIRMED') return res.redirect(process.env.FRONT_URL + '/signin');
    await this.userService.updateUser(req.user.sub, {
      status: 'CONFIRMED',
    });
    const updatedUser = await this.userService.getById(req.user.sub);
    if (updatedUser.status !== 'CONFIRMED') return res.redirect(process.env.FRONT_URL + '/signin');
    await this.authService.deleteToken(tokenDB.userId, tokenDB.token);
    const message = `${user.username} confirmed account`;

    const dtoNotification: CreateNotificationRequest = {
      recipientId: req.user.sub,
      recipientType: TypeRecipient.USER,
      type: TypeNotification.CONFIRM_ACCOUNT,
      metadata: { message },
      typeChannel: TypeChannel.IN_APP,
    };
    this.notificationService.create(dtoNotification).subscribe();
    return res.redirect(process.env.FRONT_URL + '/confirmation');
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseMessageWithData<SigninResponse>,
  })
  @Post('signin')
  async signIn(@Body() body: SigninDTO, @Res({ passthrough: true }) res: Response): Promise<ResponseMessageWithData<SigninResponse>> {
    const user = await this.userService.getByEmail(body.email);
    const compare = await this.authService.compare(user.password, body.password);
    if (!compare) throw new PreconditionFailedException('Bad credentials');
    if (user.status === 'NOT_CONFIRMED') throw new PreconditionFailedException('Not verified');
    const login: loginInterface = {
      id: user.id,
      email: user.email,
      password: user.password,
    };
    const access_token = await this.authService.generateAccessToken(user.id);
    const refresh_token = await this.authService.generateRefreshToken(user.id);
    const hashedRefresh = await this.authService.hash(refresh_token);
    const upsertDto: UpsertTokenDto = { userId: user.id, token: hashedRefresh, type: 'REFRESHTOKEN' };
    const tokenDB = await this.authService.findUniqueToken(user.id, 'REFRESHTOKEN');
    if (tokenDB) upsertDto.ancienToken = tokenDB.token;
    await this.authService.upsertToken(upsertDto);
    this.authService.generateCookie(res, refresh_token, 'refreshToken');
    const sseToken = await this.authService.generateSSE(user.id);
    this.authService.generateCookie(res, sseToken, 'sseToken');
    return {
      data: { user: login, access_token, refresh_token },
      message: 'The user is connected',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ResponseMessageWithData<RefreshResponse>,
  })
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req: RequestPayload, @Res({ passthrough: true }) res: Response): Promise<ResponseMessageWithData<RefreshResponse>> {
    const user = await this.userService.getById(req.user.sub);
    const tokenCookie: string = <string>req.cookies['refreshToken'];
    const tokenDB = await this.authService.findUniqueToken(req.user.sub, 'REFRESHTOKEN');
    const compare = await this.authService.compare(tokenDB.token, tokenCookie);
    if (!compare) throw new UnauthorizedException();
    const accessToken = await this.authService.generateAccessToken(user.id);
    const refreshToken = await this.authService.generateRefreshToken(user.id);
    const hashedRefresh = await this.authService.hash(refreshToken);
    const upsertDto: UpsertTokenDto = { userId: user.id, token: hashedRefresh, type: 'REFRESHTOKEN' };
    if (tokenDB.token) upsertDto.ancienToken = tokenDB.token;
    await this.authService.upsertToken(upsertDto);
    this.authService.generateCookie(res, refreshToken, 'refreshToken');
    this.authService.generateCookie(res, 'sessionEvent1', 'sessionId');
    return {
      data: { access_token: accessToken, refresh_token: refreshToken },
      message: 'The refresh and access token is created',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      user: User;
    }>,
  })
  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async getProfile(@Req() req: RequestPayload): Promise<
    ResponseMessageWithData<{
      user: User;
    }>
  > {
    const user = await this.userService.getById(req.user.sub);
    return {
      data: { user },
      message: 'User profile',
    };
  }

  @ApiOkResponse({
    type: ResponseMessage,
  })
  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Req() req: RequestPayload, @Res({ passthrough: true }) res: Response) {
    const user = await this.userService.getById(req.user.sub);
    const tokenDB = await this.authService.findUniqueToken(req.user.sub, 'REFRESHTOKEN');
    await this.authService.deleteToken(req.user.sub, tokenDB.token);
    res.clearCookie('refreshToken');
    res.clearCookie('sseToken');
    return {
      message: `User ${user.username} disconnected`,
    };
  }
}
