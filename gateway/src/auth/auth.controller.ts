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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponse } from './interface/user.response';
import { AccessTokenGuard } from './guard/access.token.guard';
import { ConfirmTokenGuard } from './guard/confirm.token.guard';
import { ResponseMessage } from '../responses/response.message';
import { ConfirmDTO } from './dto/confirm.dto';

@Controller('api/v1/auth')
@ApiTags('auth')
export class AuthController {
  jwtService: any;
  notificationService: any;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
    if (body.extraEmail === undefined || body.extraEmail === '')
      body.extraEmail = undefined;
    const user = await this.userService.create(body);
    console.log(
      '🚀 ~ auth.controller.ts:54 ~ AuthController ~ signUp ~ user:',
      user,
    );

    //Confirm token
    const confirm_token = await this.authService.generateToken(
      { sub: user.id },
      {
        secret: process.env.SECRET_CONFIRM_KEY,
        expiresIn: '2m',
      },
    );
    const hashed = await this.authService.hash(confirm_token);
    await this.authService.upsertToken(user.id, hashed, 'ACTIVATEACCOUNT');
    await this.authService.sendConfirmEmail(body.email, confirm_token, user.id);
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

    const confirm_token = await this.authService.generateToken(
      { sub: user.id },
      {
        secret: process.env.SECRET_CONFIRM_KEY,
        expiresIn: '2m',
      },
    );
    const hashed = await this.authService.hash(confirm_token);
    await this.authService.upsertToken(user.id, hashed, 'ACTIVATEACCOUNT');
    await this.authService.sendConfirmEmail(user.email, confirm_token, user.id);
    return {
      message: 'Confirmation email sent',
    };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(ConfirmTokenGuard)
  @ApiOkResponse({description: "Account confirmation"})
  @Get('confirm/:token')
  async confirm(
    @Req() req: RequestPayload,
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    const tokenDB = await this.authService.findUniqueToken(req.user.sub, token);
    if (tokenDB.type !== 'ACTIVATEACCOUNT') {
      return res.redirect(process.env.FRONT_URL + '/signin');
    }
    const compare = await this.authService.compare(tokenDB.token, token);
    console.log(
      '🚀 ~ auth.controller.ts:92 ~ AuthController ~ confirm ~ compare:',
      compare,
    );

    if (!compare) {
      return res.redirect(process.env.FRONT_URL + '/signin');
    }

    let user = await this.userService.getById(req.user.sub);
    console.log(
      '🚀 ~ auth.controller.ts:98 ~ AuthController ~ confirm ~ user:',
      user,
    );

    if (user.status !== 'NOT_CONFIRMED') {
      return res.redirect(process.env.FRONT_URL + '/signin');
    }
    await this.userService.updateUser(req.user.sub, {
      status: 'CONFIRMED',
    });

    const updatedUser = await this.userService.getById(req.user.sub)
  
    if (updatedUser.status !== 'CONFIRMED') {
      return res.redirect(process.env.FRONT_URL + '/signin');
    }

    console.log(
      '🚀 ~ auth.controller.ts:104 ~ AuthController ~ confirm ~ user:',
      updatedUser,
    );
    await this.authService.deleteToken(tokenDB.userId, tokenDB.token);

    return res.redirect(process.env.FRONT_URL + '/confirmation');
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      user: loginInterface;
      access_token: string;
      refresh_token: string;
    }>,
  })
  @Post('signin')
  async signIn(
    @Body() body: SigninDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    ResponseMessageWithData<{
      user: loginInterface;
      access_token: string;
      refresh_token: string;
    }>
  > {
    const user = await this.userService.getByEmail(body.email);
    console.log("🚀 ~ auth.controller.ts:173 ~ AuthController ~ signIn ~ user:", user)
    const compare = await this.authService.compare(
      user.password,
      body.password,
    );
    if (!compare) {
      throw new PreconditionFailedException('Bad credentials');
    }
    if (user.status === 'NOT_CONFIRMED') {
      throw new PreconditionFailedException('Not verified');
    }
    
    console.log(user, compare);
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
        expiresIn: '15m',
      },
    );

    const hashedRefresh = await this.authService.hash(refresh_token);

    await this.authService.upsertToken(user.id, hashedRefresh);
    res.cookie('refreshToken', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      data: { user: login, access_token, refresh_token },
      message: 'The user is connected',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ResponseMessageWithData<{
      access_token: string;
      refresh_token: string;
    }>,
  })
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Req() req: RequestPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    ResponseMessageWithData<{
      access_token: string;
      refresh_token: string;
    }>
  > {
    const user = await this.userService.getById(req.user.sub);
    const tokenDB = await this.authService.findUniqueToken(
      req.user.sub,
      req.cookies['refreshToken'],
    );
    console.log(
      '🚀 ~ auth.controller.ts:161 ~ AuthController ~ refresh ~ tokenDB:',
      tokenDB,
    );

    const compare = await this.authService.compare(
      tokenDB.token,
      req.cookies['refreshToken'],
    );
    console.log(
      '🚀 ~ auth.controller.ts:165 ~ AuthController ~ refresh ~ compare:',
      compare,
    );

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
        expiresIn: '15m',
      },
    );

    const hashedRefresh = await this.authService.hash(refresh_token);

    await this.authService.upsertToken(
      user.id,
      hashedRefresh,
      'REFRESHTOKEN',
      tokenDB.token,
    );
    res.cookie('refreshToken', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("sessionId", "sessionEvent1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return {
      data: { access_token, refresh_token },
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
}
