import { PrismaService } from '../../prisma/prisma.service';
import { SharesCreateDto } from './dto/shares.create.dto';
import { AccessShareDto } from './dto/access.share.dto';
export declare class ShareService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createShares(fileId: number, userId: number, data: SharesCreateDto): Promise<{
        sharesUsers: {
            status: import("@prisma/client").$Enums.EnumStatusShare | null;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            fileId: number;
            accessType: import("@prisma/client").$Enums.EnumAccessType;
            expirationDate: Date | null;
        }[];
        sharesGroups: {
            status: import("@prisma/client").$Enums.EnumStatusShare | null;
            createdAt: Date;
            updatedAt: Date;
            fileId: number;
            groupId: number;
            accessType: import("@prisma/client").$Enums.EnumAccessType;
            expirationDate: Date | null;
        }[];
    }[]>;
    editAccessFileUser(idFile: number, idUser: number, data: AccessShareDto): Promise<{
        userId: number;
        fileId: number;
        accessType: import("@prisma/client").$Enums.EnumAccessType;
        expirationDate: Date;
    }>;
    editAccessFileGroup(idFile: number, idGroup: number, data: AccessShareDto): Promise<{
        fileId: number;
        groupId: number;
        accessType: import("@prisma/client").$Enums.EnumAccessType;
        expirationDate: Date;
    }>;
    getReceivers(idUser: number): Promise<{
        users: {
            email: string;
            id: number;
        }[];
        groups: {
            id: number;
            name: string;
        }[];
    }>;
}
