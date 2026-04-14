import { EnumAccessType } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class SharesCreateDto {
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  users?: number[];

  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  groups?: number[];

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  expirationDate?: Date;

  @IsEnum(EnumAccessType)
  @IsNotEmpty()
  accessType: EnumAccessType;
}

export class SharesCreateUserDto {
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  users?: number[];

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  expirationDate?: Date;

  @IsEnum(EnumAccessType)
  @IsNotEmpty()
  accessType: EnumAccessType;
}

export class SharesCreateGroupDto {
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  groups?: number[];

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  expirationDate?: Date;

  @IsEnum(EnumAccessType)
  @IsNotEmpty()
  accessType: EnumAccessType;
}
