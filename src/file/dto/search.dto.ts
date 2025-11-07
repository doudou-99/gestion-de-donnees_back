import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SearchDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    typeFile?: string;

    @IsDateString()
    @IsNotEmpty()
    @IsOptional()
    updatedAt: Date | null;
}