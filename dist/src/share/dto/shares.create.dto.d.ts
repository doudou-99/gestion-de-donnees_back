import { EnumAccessType } from "@prisma/client";
export declare class SharesCreateDto {
    users?: number[];
    groups?: number[];
    expirationDate?: Date;
    accessType: EnumAccessType;
}
