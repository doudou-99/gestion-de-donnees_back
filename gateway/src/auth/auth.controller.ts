import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  PreconditionFailedException,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SigninDTO } from './dto/signin.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { ResponseMessageWithData } from '../responses/response.message.with.data';
import { loginInterface } from './interface/logininterface';
import type { RequestPayload, RequestPayloadWithRefresh } from './interface/payload.interface';
import { RefreshTokenGuard } from './guard/refresh.token.guard';
import { User } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenGuard } from './guard/access.token.guard';
import { TypeRecipient } from '../notification/enums/EnumTypeRecipient';
import { TypeNotification } from '../notification/enums/EnumTypeNotification';
import { TypeChannel } from '../notification/enums/EnumTypeChannel';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(@Body() body: SigninDTO): Promise<
    ResponseMessageWithData<{
      user: loginInterface;
      access_token: string;
      refresh_token: string;
    }>
  > {
    const user = await this.userService.getByEmail(body.email);
    const compare = await this.authService.compare(
      user.password,
      body.password,
    );
    if (user.status === 'NOT_CONFIRMED') {
      throw new PreconditionFailedException();
    }
    if (!compare) {
      throw new PreconditionFailedException('Bad credentials');
    }
    const login: loginInterface = {
      id: user.id,
      email: user.email,
      password: user.password,
    };
    const access_token = await this.authService.generateToken(
      { sub: user.id },
      {
        secret: process.env.SECRET_KEY,
        expiresIn: '60s',
      },
    );
    const refresh_token = await this.authService.generateToken(
      { sub: user.id },
      {
        algorithm: 'HS512',
        secret: process.env.SECRET_REFRESH_KEY,
        expiresIn: '240s',
      },
    );
    await this.authService.upsertToken(user.id, await this.authService.hash(refresh_token));
    const t = this.jwtService.decode(access_token);
    if (t?.exp) {
      let metadata: any = JSON.stringify({"recipient": user.email})
      this.notificationService.create({message:"Expired token", metadata,
         recipientId: user.id, recipientType: TypeRecipient.USER, type: TypeNotification.EXPIRED_TOKEN, typeChannel: TypeChannel.PUSH})
    }
    return {
      data: { user: login, access_token, refresh_token },
      message: 'The user is connected'
    };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req: RequestPayloadWithRefresh): Promise<
    ResponseMessageWithData<{
      access_token: string;
      refresh_token: string;
    }>
  > {
    const user = await this.userService.getById(req.user.sub);
    const tokenDB = await this.authService.findUniqueToken(req.user.sub);
    const compare = await this.authService.compare(tokenDB.token, req.refresh_token);
    if (!compare) {
        throw new UnauthorizedException();
    }
    const access_token = await this.authService.generateToken(
      { sub: user.id },
      {
        secret: process.env.SECRET_KEY,
        expiresIn: '60s',
      },
    );
    const refresh_token = await this.authService.generateToken(
      { sub: user.id },
      {
        algorithm: 'HS512',
        secret: process.env.SECRET_REFRESH_KEY,
        expiresIn: '240s',
      },
    );
    await this.authService.upsertToken(user.id, await this.authService.hash(refresh_token));
    return {
      data: { access_token, refresh_token },
      message: 'The refresh and access token is created'
    };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async get(@Req() req: RequestPayload): Promise<
   User> {
    const user = await this.userService.getById(req.user.sub);
    const t = this.jwtService.decode(req.headers.authorization.split(" ")[1]);
    if (t?.exp) {
      let metadata: any = JSON.stringify({"recipient": user.email})
      this.notificationService.create({message:"Expired token", metadata,
        recipientId: user.id, recipientType: TypeRecipient.USER, type: TypeNotification.EXPIRED_TOKEN, typeChannel: TypeChannel.PUSH})
      }
    return user;
  }

}
