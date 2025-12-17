
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RequestPayload } from '../interface/payload.interface';
  
@Injectable()
export class ConfirmTokenGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request: RequestPayload = context.switchToHttp().getRequest();
      const token = this.extractTokenFromURL(request);
      if (token === undefined) {
        throw new UnauthorizedException();
      }
      try {
        const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.SECRET_CONFIRM_KEY
          }
        );
        request.user = payload;
      } catch {
        throw new UnauthorizedException();
      }
      return true;
    }
  
    private extractTokenFromURL(request: Request): string | undefined {
      const token = request.params["token"];
      console.log("🚀 ~ confirm.token.guard.ts:37 ~ ConfirmTokenGuard ~ extractTokenFromURL ~ token:", token)
      return token;
    }
}
  