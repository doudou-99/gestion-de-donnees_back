import { $Enums } from '@prisma/client';

export interface ShareCreateResponse {
  sharesUsers: {
    accessType: $Enums.EnumAccessType;
    expirationDate: Date | null;
    status: $Enums.EnumStatusShare | null;
    createdAt: Date;
    updatedAt: Date;
    fileId: number;
    userId: number;
  }[];
  sharesGroups: {
    accessType: $Enums.EnumAccessType;
    expirationDate: Date | null;
    status: $Enums.EnumStatusShare | null;
    createdAt: Date;
    updatedAt: Date;
    fileId: number;
    groupId: number;
  }[];
}
