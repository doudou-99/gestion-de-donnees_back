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
import { CreateNotificationRequest } from '../../notification/dto/create.notification.request';
import { TypeRecipient } from '../../notification/enums/EnumTypeRecipient';
import { TypeNotification } from '../../notification/enums/EnumTypeNotification';
import { TypeChannel } from '../../notification/enums/EnumTypeChannel';
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
      const sub = request.cookies["payload"].sub;
      const user = await this.userService.getById(sub);
      const dto: CreateNotificationRequest = {
        message: 'Expired token',
        metadata: {
          recipient: user.email,
        },
        recipientId: sub,

        recipientType: TypeRecipient.USER,
        type: TypeNotification.EXPIRED_TOKEN,
        typeChannel: TypeChannel.EMAIL,
      };
      this.notificationService.create(dto).subscribe();
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
