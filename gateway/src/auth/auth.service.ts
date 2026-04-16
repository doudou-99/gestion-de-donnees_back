import { BadRequestException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PayloadInterface } from './interface/payload.interface';
import { JwtOptionsInterface } from './interface/jwt.options.interface';
import { EnumTokenType, Token } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { TypeRecipient } from '../notification/enums/EnumTypeRecipient';
import { TypeNotification } from '../notification/enums/EnumTypeNotification';
import { TypeChannel } from '../notification/enums/EnumTypeChannel';
import { UpsertTokenDto } from './interface/upsert.token.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async hash(elementToHash: string): Promise<string> {
    try {
      return await argon2.hash(elementToHash);
    } catch (err) {
      throw new BadRequestException('Hash error:' + err);
    }
  }

  async compare(hashed: string, notHashed: string): Promise<boolean> {
    try {
      return await argon2.verify(hashed, notHashed);
    } catch (err) {
      throw new BadRequestException('Compare error:' + err);
    }
  }

  async generateToken(payload: PayloadInterface, options: JwtOptionsInterface): Promise<string> {
    const optionsJWT: JwtSignOptions = {
      ...options,
    };
    return await this.jwtService.signAsync(payload, optionsJWT);
  }

  async generateConfirmToken(userId: number) {
    return await this.generateToken(
      { sub: userId },
      {
        secret: process.env.SECRET_CONFIRM_KEY,
        expiresIn: '2m',
      },
    );
  }

  async generateAccessToken(userId: number) {
    return await this.generateToken(
      { sub: userId },
      {
        secret: process.env.SECRET_KEY,
        expiresIn: '60s',
      },
    );
  }

  async generateRefreshToken(userId: number) {
    return await this.generateToken(
      { sub: userId },
      {
        algorithm: 'HS512',
        secret: process.env.SECRET_REFRESH_KEY,
        expiresIn: '15m',
      },
    );
  }

  async generateSSE(userId: number) {
    return await this.generateToken(
      { sub: userId },
      {
        algorithm: 'HS512',
        secret: process.env.SECRET_SSE_KEY,
        expiresIn: '24h',
      },
    );
  }

  generateCookie(res: Response, valueCookie: string, nameCookie: string) {
    res.cookie(nameCookie, valueCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  async upsertToken(data: UpsertTokenDto): Promise<Token> {
    const { token, type, userId, ancienToken, expiresAt } = data;
    console.log(ancienToken, token);
    if (ancienToken) {
      await this.prisma.token.deleteMany({
        where: { userId, type },
      });
    }
    return await this.prisma.token.upsert({
      where: { type_userId: { type, userId } },
      update: { token, expiresAt },
      create: { token, userId, type, expiresAt },
    });
  }

  async findUniqueToken(userId: number, type: EnumTokenType): Promise<Token> {
    const token = await this.prisma.token.findFirst({
      where: { userId, type },
    });
    return token;
  }

  async deleteToken(userId: number, token: string): Promise<void> {
    await this.prisma.token.delete({
      where: {
        token,
      },
    });
  }

  sendConfirmEmail(email: string, token: string, idRecipient: number) {
    const url = `${process.env.BASE_URL}/api/v1/auth/confirm/${token}`;
    const message = `
    <p>
      Welcome to the app Gestion de données, click in the link to confirm the account: <a data-cy="linkConfirm" href=${url}>here</a>
    </p>
    <strong>
      The link is invalid after two minutes.
    </strong>
    `;
    this.notificationService
      .create({
        recipientType: TypeRecipient.USER,
        type: TypeNotification.CONFIRM_ACCOUNT,
        typeChannel: TypeChannel.EMAIL,
        metadata: { recipient: email, message },
        recipientId: idRecipient,
      })
      .subscribe();
  }
}
