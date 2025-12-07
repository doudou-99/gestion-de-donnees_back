import { EnumAccessType } from "@prisma/client";
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

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