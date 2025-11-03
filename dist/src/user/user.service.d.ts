import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getById(id: number): Promise<User>;
    getByEmail(email: string): Promise<User>;
}
