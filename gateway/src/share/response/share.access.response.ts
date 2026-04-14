import { EnumAccessType } from '@prisma/client';

export interface ShareAccessUserResponse {
  accessType: EnumAccessType;
  expirationDate: Date;
  fileId: number;
  userId: number;
}

export interface ShareAccessGroupResponse {
  accessType: EnumAccessType;
  expirationDate: Date;
  fileId: number;
  groupId: number;
}
