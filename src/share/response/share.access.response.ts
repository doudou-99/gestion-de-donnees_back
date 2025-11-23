import { EnumAccessType } from "@prisma/client";

export interface ShareAccessResponse {
    accessType: EnumAccessType;
    expirationDate: Date;
    fileId: number;
    userId: number;
}