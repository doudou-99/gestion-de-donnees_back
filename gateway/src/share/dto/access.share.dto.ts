import { EnumAccessType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class AccessShareDto {
  @IsEnum(EnumAccessType)
  @IsNotEmpty()
  accessType: EnumAccessType;
}
