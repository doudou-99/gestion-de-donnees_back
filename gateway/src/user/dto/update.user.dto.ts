import { ApiProperty } from '@nestjs/swagger';
import { EnumUserStatus } from '@prisma/client';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  Length,
  IsStrongPassword,
  ValidateIf,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @ValidateIf((_, value) => value !== '' && value !== undefined)
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, minLength: 5 })
  @IsString()
  @IsNotEmpty()
  @Length(5)
  @IsOptional()
  username?: string;

  @ApiProperty({ required: false, minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 2,
    minSymbols: 1,
    minUppercase: 1,
  })
  @IsOptional()
  password?: string;

  @ApiProperty({ required: false })
  @ValidateIf((_, value) => value !== '' && value !== undefined)
  @IsEmail()
  @IsOptional()
  extraEmail?: string;

  @ApiProperty({ required: false })
  @IsEnum(EnumUserStatus)
  @IsOptional()
  status?: EnumUserStatus;
}
