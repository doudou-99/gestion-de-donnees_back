import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { RequestPayload } from '../interface/payload.interface';
import { NotificationService } from '../../notification/notification.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestPayload = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });
      request.user = payload;
      response.cookie("payload", request.user, {httpOnly: true})
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
