import { JwtService } from '@nestjs/jwt';
import { PayloadInterface } from './interface/payload.interface';
import { JwtOptionsInterface } from './interface/jwt.options.interface';
import { EnumTokenType, Token } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    private readonly mailService;
    constructor(jwtService: JwtService, prisma: PrismaService, mailService: MailService);
    hash(elementToHash: string): Promise<string>;
    compare(hashed: string, notHashed: string): Promise<boolean>;
    generateToken(payload: PayloadInterface, options: JwtOptionsInterface): Promise<string>;
    upsertToken(userId: number, token: string, type?: EnumTokenType, ancienToken?: string, expiresAt?: Date): Promise<Token>;
    findUniqueToken(userId: number, tokenClear: string): Promise<Token>;
    deleteToken(userId: number, token: string): Promise<void>;
    sendConfirmEmail(email: string, token: string): Promise<void>;
}
