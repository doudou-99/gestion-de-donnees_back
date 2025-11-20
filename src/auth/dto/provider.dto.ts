import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ProviderDto {
    @IsString()
    @IsNotEmpty()
    providerId: string;

    @IsString()
    @IsNotEmpty()
    provider: string;

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    accessToken?: string;
}