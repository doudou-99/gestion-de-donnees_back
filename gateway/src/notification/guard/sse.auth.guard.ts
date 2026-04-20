import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { RequestPayload, PayloadInterface } from '../../auth/interface/payload.interface';
@Injectable()
export class SseAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestPayload = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: PayloadInterface = await this.jwtService.verifyAsync(token, {
        algorithms: ['HS512'],
        secret: process.env.SECRET_SSE_KEY,
      });
      request.user = payload;
    } catch (err) {
      throw new UnauthorizedException(err);
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const token = <string>request.cookies['sseToken'] ?? undefined;
    return token;
  }
}
