import { $Enums } from '@prisma/client';

export interface ShareGroupsUsersResponse {
  sharesUsers: {
    user: {
      status: $Enums.EnumUserStatus;
      createdAt: Date;
      updatedAt: Date;
      id: number;
      username: string;
      email: string;
      password: string;
      address: string;
      additionalAddress: string | null;
      zipCode: string;
      extraEmail: string | null;
    };
    userId: number;
    fileId: number;
    accessType: $Enums.EnumAccessType;
  }[];
  sharesGroups: {
    fileId: number;
    groupId: number;
    accessType: $Enums.EnumAccessType;
    expirationDate: Date;
    group: {
      name: string;
      createdAt: Date;
      updatedAt: Date;
      id: number;
      leaderId: number;
    };
  }[];
}
