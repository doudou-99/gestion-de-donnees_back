import { BadRequestException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { Response } from 'express';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PayloadInterface } from './interface/payload.interface';
import { JwtOptionsInterface } from './interface/jwt.options.interface';
import { Token } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UpsertTokenDto } from './interface/upsert.token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async hash(elementToHash: string): Promise<string> {
    try {
      return await argon2.hash(elementToHash);
    } catch (err) {
      throw new BadRequestException(`Hash error: ${err}`);
    }
  }

  async compare(hashed: string, notHashed: string): Promise<boolean> {
    try {
      return await argon2.verify(hashed, notHashed);
    } catch (err) {
      throw new BadRequestException(`Compare error: ${err}`);
    }
  }

  async generateToken(payload: PayloadInterface, options: JwtOptionsInterface): Promise<string> {
    const optionsJWT: JwtSignOptions = {
      ...options,
      expiresIn: options.expiresIn,
    };
    return await this.jwtService.signAsync(payload, optionsJWT);
  }

  async upsertToken(data: UpsertTokenDto): Promise<Token> {
    const tokenJSON = data.ancienToken
      ? { token: data.ancienToken, userId: data.userId }
      : { token: data.ancienToken, userId: data.userId };
    return await this.prisma.token.upsert({
      create: data,
      where: { token_userId: tokenJSON, type: data.type },
      update: { token: data.token, expiresAt: data.expiresAt },
    });
  }

  createRefreshTokenCookie(res: Response, token: string, maxAge: number) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAge,
    });
  }

  async createRefreshToken(userId: number) {
    return await this.generateToken(
      { sub: userId },
      {
        algorithm: 'HS512',
        secret: process.env.SECRET_REFRESH_KEY,
        expiresIn: '15m',
      },
    );
  }

  async createAccessToken(userId: number) {
    return await this.generateToken({ sub: userId }, { secret: process.env.SECRET_KEY, expiresIn: '60s' });
  }

  async findUniqueToken(userId: number, tokenClear: string): Promise<Token> {
    const tokens: Token[] = await this.prisma.token.findMany({
      where: { userId: userId },
    });
    for (const t of tokens) {
      console.log('🚀 ~ auth.service.ts:65 ~ AuthService ~ findUniqueToken ~ t:', t);
      const compareToken = await this.compare(t.token, tokenClear);
      if (compareToken) {
        console.log(
          '🚀 ~ auth.service.ts:67 ~ AuthService ~ findUniqueToken ~ this.compare(t.token, tokenClear):',
          this.compare(t.token, tokenClear),
        );
        return t;
      }
    }
    return null;
  }

  async deleteToken(userId: number, token: string): Promise<void> {
    await this.prisma.token.delete({
      where: {
        token_userId: { userId, token },
      },
    });
  }

  async sendConfirmEmail(email: string, token: string) {
    const url = `${process.env.BASE_URL}/api/v1/auth/confirm/${token}`;
    const message = `
    <p>
      Welcome to the app Gestion de données, click in the link to confirm the account: <a data-cy="linkConfirm" href=${url}>here</a>
    </p>
    <strong>
      The link is invalid after two minutes.
    </strong>
    `;
    await this.mailService.sendEmail(email, process.env.MAIL_USERNAME, 'Confirm mail', message);
  }
}
