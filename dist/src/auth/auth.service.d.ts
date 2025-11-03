import { JwtService } from '@nestjs/jwt';
import { PayloadInterface } from './interface/payload.interface';
import { JwtOptionsInterface } from './interface/jwt.options.interface';
import { EnumTokenType, Token } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    hash(elementToHash: string): Promise<string>;
    compare(hashed: string, notHashed: string): Promise<boolean>;
    generateToken(payload: PayloadInterface, options: JwtOptionsInterface): Promise<string>;
    upsertToken(userId: number, token: string, type?: EnumTokenType, expiresAt?: Date): Promise<void>;
    findUniqueToken(userId: number, type?: EnumTokenType): Promise<Token>;
}
