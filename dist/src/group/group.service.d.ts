import { PrismaService } from '../../prisma/prisma.service';
export declare class GroupService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getById(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        leaderId: number;
    }>;
}
