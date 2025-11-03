import { BadRequestException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PayloadInterface } from './interface/payload.interface';
import { JwtOptionsInterface } from './interface/jwt.options.interface';
import { EnumTokenType, Token } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
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
    return await this.jwtService.signAsync(payload, options);
  }

  async upsertToken(
    userId: number,
    token: string,
    type: EnumTokenType = 'REFRESHTOKEN',
    expiresAt?: Date,
  ): Promise<void> {
    await this.prisma.token.upsert({
      create: {
        token,
        userId,
        type,
        expiresAt,
      },
      where: { type_userId: { type, userId } },
      update: { token, expiresAt },
    });
  }

  async findUniqueToken(userId: number, type: EnumTokenType = "REFRESHTOKEN"): Promise<Token> {
    return this.prisma.token.findUniqueOrThrow({
        where: {type_userId: {type, userId}}
    });
  }
}
