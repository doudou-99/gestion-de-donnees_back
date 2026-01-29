import { EnumStatusFile, File } from "@prisma/client";
export declare class FileResponse implements Partial<File> {
    id: number;
    name: string;
    path: string;
    shareUrl?: string;
    size: number;
    userId: number;
    createdAt: Date;
    parentId?: number;
    mimeType: string;
    status?: EnumStatusFile;
    updatedAt: Date;
    version?: string;
}
