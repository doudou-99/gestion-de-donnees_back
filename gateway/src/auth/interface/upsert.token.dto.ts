import { EnumTokenType } from '@prisma/client';

export class UpsertTokenDto {
  userId: number;
  token: string;
  type: EnumTokenType = 'REFRESHTOKEN';
  ancienToken?: string;
  expiresAt?: Date;
}
