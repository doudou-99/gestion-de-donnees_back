import { PrismaService } from '../../prisma/prisma.service';
import { File } from '@prisma/client';
import { RenameFileDto } from './dto/rename.file.dto';
export type Sort = 'name' | 'updatedAt';
export type Order = 'ASC' | 'DESC';
export declare class FileService {
    private readonly prisma;
    private readonly s3Client;
    constructor(prisma: PrismaService);
    importFiles(files: Array<Express.Multer.File>, userId: number): Promise<File[]>;
    getTotalSizeObjets(): Promise<number>;
    getFiles(userId: number, page?: number, sort?: Sort, limit?: number, order?: Order): Promise<{
        status: import("@prisma/client").$Enums.EnumStatusFile | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        userId: number;
        size: number | null;
        path: string;
        mimeType: string;
        shareUrl: string | null;
        parentId: number | null;
        version: string | null;
    }[]>;
    getFileUrl(id: number): Promise<string>;
    searchFiles(userId: number, updatedAt: Date | null, name?: string, typeFile?: string, page?: number, sort?: Sort, limit?: number, order?: Order): Promise<{
        status: import("@prisma/client").$Enums.EnumStatusFile | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        userId: number;
        size: number | null;
        path: string;
        mimeType: string;
        shareUrl: string | null;
        parentId: number | null;
        version: string | null;
    }[]>;
    getOwnerFile(idFile: number): Promise<{
        username: string;
        email: string;
        password: string;
        extraEmail: string | null;
        status: import("@prisma/client").$Enums.EnumUserStatus;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    moveFileToBin(idFile: number): Promise<{
        status: import("@prisma/client").$Enums.EnumStatusFile | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        userId: number;
        size: number | null;
        path: string;
        mimeType: string;
        shareUrl: string | null;
        parentId: number | null;
        version: string | null;
    }>;
    getFilesBin(userId: number, page?: number, sort?: Sort, limit?: number, order?: Order): Promise<{
        status: import("@prisma/client").$Enums.EnumStatusFile | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        userId: number;
        size: number | null;
        path: string;
        mimeType: string;
        shareUrl: string | null;
        parentId: number | null;
        version: string | null;
    }[]>;
    moveFileToHome(idFile: number): Promise<{
        status: import("@prisma/client").$Enums.EnumStatusFile | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        userId: number;
        size: number | null;
        path: string;
        mimeType: string;
        shareUrl: string | null;
        parentId: number | null;
        version: string | null;
    }>;
    getAccessUsersGroupsFile(idFile: number): Promise<{
        sharesUsers: {
            userId: number;
            fileId: number;
            accessType: import("@prisma/client").$Enums.EnumAccessType;
            expirationDate: Date;
        }[];
        sharesGroups: {
            fileId: number;
            groupId: number;
            accessType: import("@prisma/client").$Enums.EnumAccessType;
            expirationDate: Date;
        }[];
    }>;
    renameFile(id: number, data: RenameFileDto): Promise<{
        status: import("@prisma/client").$Enums.EnumStatusFile | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        userId: number;
        size: number | null;
        path: string;
        mimeType: string;
        shareUrl: string | null;
        parentId: number | null;
        version: string | null;
    }>;
    detailsFile(id: number): Promise<{
        status: import("@prisma/client").$Enums.EnumStatusFile | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        userId: number;
        size: number | null;
        path: string;
        mimeType: string;
        shareUrl: string | null;
        parentId: number | null;
        version: string | null;
    }>;
    deleteFiles(files: number[]): Promise<void>;
}
