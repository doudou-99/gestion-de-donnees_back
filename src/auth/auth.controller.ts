import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import type { RequestPayloadWithRefresh } from './interface/payload.interface';
import { RefreshTokenGuard } from './guard/refresh.token.guard';
import { SignupDto } from './dto/signup.dto';
import { User } from '@prisma/client';
import type { Request, Response } from 'express';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserResponse } from './interface/user.response';
import { GoogleOauthGuard } from './google/googla.oauth.guard';
import { ProviderService } from './provider/provider.service';


@Controller('api/v1/auth')
@ApiTags("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly providerService: ProviderService
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({type:  ResponseMessageWithData<{
    user: UserResponse;
  }>})
  @Post('signup')
  async signUp(@Body() body: SignupDto, @Req() req: Request, @Res({passthrough: true}) res: Response): Promise<
    ResponseMessageWithData<{
      user: User;
    }>
  > {
    const userGoogle = await this.authService.findUserGoogle(body.email)
    const provider = await this.providerService.findProvider(process.env.GOOGLE_CLIENT_ID, "google")

    if (userGoogle !== undefined && userGoogle !== null && provider !== undefined && provider !== null) {
      body.password = await this.authService.hash(body.password);
      const userUpdated = await this.userService.updateUser(userGoogle.email, body);
      return {
        data: { user: userUpdated },
        message: 'The user is created'
      };
    } else {
      body.password = await this.authService.hash(body.password)
      const user = await this.userService.create(body)
  
      //Confirm token
      const confirm_token = await this.authService.generateToken(
        { sub: user.id },
        {
          secret: process.env.SECRET_CONFIRM_KEY,
          expiresIn: '60s',
        }
      )
      const hashed = await this.authService.hash(confirm_token)
      await this.authService.upsertToken(user.id, hashed, "ACTIVATEACCOUNT")
      await this.authService.sendConfirmEmail(body.email, confirm_token)
      return {
        data: { user },
        message: 'The user is created'
      };
    }
  }


  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({type: ResponseMessageWithData<{
    user: loginInterface;
    access_token: string;
    refresh_token: string;
  }> })
  @Post('signin')
  async signIn(@Body() body: SigninDTO, @Res({passthrough: true}) res: Response): Promise<
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
        expiresIn: '15m',
      },
    );

    await this.authService.upsertToken(user.id, await this.authService.hash(refresh_token));
    res.cookie("refreshToken", refresh_token, {httpOnly: true, secure: process.env.NODE_ENV === "production"})
    return {
      data: { user: login, access_token, refresh_token },
      message: 'The user is connected'
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({type: ResponseMessageWithData<{
    access_token: string;
    refresh_token: string;
  }> })
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req: RequestPayloadWithRefresh, @Res({passthrough: true}) res: Response): Promise<
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
        expiresIn: '15m',
      },
    );
    await this.authService.upsertToken(user.id, await this.authService.hash(refresh_token));
    res.cookie("refreshToken", refresh_token, {httpOnly: true, secure: process.env.NODE_ENV === "production"});
    return {
      data: { access_token, refresh_token },
      message: 'The refresh and access token is created'
    };
  }


  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({})
  @UseGuards(GoogleOauthGuard)
  @Get('google')
  async accessGoogle() {
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({})
  @UseGuards(GoogleOauthGuard)
  @Get('logoutgoogle')
  async logoutGoogle(@Req() req: Request, @Res() res: Response) {
    res.clearCookie("google_token");
    req.logOut({keepSessionInfo: false}, (err: any) => {
      if (err) console.error(err);
      res.redirect(process.env.FRONT_URL+"/signin")
    })
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(GoogleOauthGuard)
  @ApiOkResponse({})
  @Get('google/callback')
  async callback(@Req() req, @Res({passthrough: true}) res: Response) {
    console.log("request", req.user.email)
    const user = await this.authService.findOrCreateUser({
      email: req.user.email, 
      accessToken: req.user.accessToken
    });

    const googleToken = req.user.accessToken;
    console.log("🚀 ~ auth.controller.ts:198 ~ AuthController ~ callback ~ googleToken:", googleToken)
    const googleRefreshToken = req.user.refreshToken;
    console.log("🚀 ~ auth.controller.ts:200 ~ AuthController ~ callback ~ googleRefreshToken:", googleRefreshToken)

    console.log(user)

    res.cookie("google_token", googleToken, {httpOnly: true, secure: process.env.NODE_ENV === "production"})

    if (user.password === undefined || user.password === null || user.address === undefined || user.address === null ||
      user.username === undefined || user.username === null || user.zipCode === undefined || user.zipCode === null) {
        res.redirect(process.env.FRONT_URL+"/signup")
    } else {
      res.redirect(process.env.FRONT_URL+"/signin")
    }
    
  }
}
