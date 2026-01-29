import { $Enums } from '@prisma/client';
export interface ShareGroupsUsersResponse {
    sharesUsers: {
        userId: number;
        fileId: number;
        accessType: $Enums.EnumAccessType;
        expirationDate: Date;
    }[];
    sharesGroups: {
        fileId: number;
        groupId: number;
        accessType: $Enums.EnumAccessType;
        expirationDate: Date;
    }[];
}
