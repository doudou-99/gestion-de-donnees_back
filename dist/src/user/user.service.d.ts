import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from '../auth/dto/signup.dto';
import { UserEmailResponse } from './response/user.email.response';
import { UpdateUserDto } from './dto/update.user.dto';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: SignupDto): Promise<{
        username: string;
        email: string;
        password: string;
        extraEmail: string | null;
        status: import("@prisma/client").$Enums.EnumUserStatus;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    getById(id: number): Promise<User>;
    getEmailById(id: number): Promise<UserEmailResponse>;
    getByEmail(email: string): Promise<User>;
    updateUser(id: number, data: UpdateUserDto): Promise<User>;
}
