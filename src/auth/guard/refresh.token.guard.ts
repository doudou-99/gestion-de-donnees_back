import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { RequestPayloadWithRefresh } from '../interface/payload.interface';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestPayloadWithRefresh = context.switchToHttp().getRequest();

    console.log('All cookies:', request.cookies);
    console.log('Signed cookies:', request.signedCookies);

    const token = this.extractTokenFromCookie(request);
    console.log(token);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        algorithms: ['HS512'],
        secret: process.env.SECRET_REFRESH_KEY,
      });
      request.user = payload;
    } catch (err: any) {
      throw new UnauthorizedException(err.message);
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    console.log(request.cookies);
    const token = request.cookies['refreshToken'] ?? undefined;
    return token;
  }
}
