import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PayloadInterface } from './interface/payload.interface';
import { JwtOptionsInterface } from './interface/jwt.options.interface';
import { EnumTokenType, Token } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

  async hash(elementToHash: string): Promise<string> {
    try {
      return await argon2.hash(elementToHash);
    } catch (err) {
      throw new BadRequestException('Hash error');
    }
  }

  async compare(hashed: string, notHashed: string): Promise<boolean> {
    try {
      return await argon2.verify(hashed, notHashed);
    } catch (err) {
      throw new BadRequestException('Compare error');
    }
  }

  async generateToken(payload: PayloadInterface, options: JwtOptionsInterface): Promise<string> {
    const optionsJWT: JwtSignOptions = {
      ...options,
      expiresIn: options.expiresIn as any
    }
    return await this.jwtService.signAsync(payload, optionsJWT);
  }

  async upsertToken(
    userId: number,
    token: string,
    type: EnumTokenType = 'REFRESHTOKEN',
    ancienToken?: string,
    expiresAt?: Date,
  ): Promise<Token> {
    const tokenJSON = ancienToken ? {token:ancienToken, userId} :  {token, userId}
    return await this.prisma.token.upsert({
      create: {
        token,
        userId,
        type,
        expiresAt,
      },
      where: { token_userId: tokenJSON, type },
      update: { token, expiresAt },
    });
  }

  async findUniqueToken(userId: number, tokenClear: string): Promise<Token> {
    const tokens = await this.prisma.token.findMany({
      where: {userId: userId}
    });
    for (let t of tokens) {
      console.log("🚀 ~ auth.service.ts:65 ~ AuthService ~ findUniqueToken ~ t:", t);
      const compareToken = await this.compare(t.token, tokenClear);
      if (compareToken) {
        console.log("🚀 ~ auth.service.ts:67 ~ AuthService ~ findUniqueToken ~ this.compare(t.token, tokenClear):", this.compare(t.token, tokenClear));
        return t;
      }
    }
    return null;
  }

  async sendConfirmEmail(email: string, token: string) {
    const url = `${process.env.BASE_URL}/api/v1/auth/confirm/${token}`;
    const message = `
    <p>
      Welcome to the app Gestion de données, click in the link to confirm the account: <a href=${url}>here</a>
    </p>
    <strong>
      The link is invalid after one minute.
    </strong>
    `;
    this.mailService.sendEmail(email, process.env.MAIL_USERNAME, "Confirm mail", message);
  }
}
