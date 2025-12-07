import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail, IsStrongPassword, IsString, Length, IsOptional, IsPostalCode } from "class-validator";

export class AddUserDTO {
    @ApiProperty({required: true, uniqueItems: true})
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({required: true, minLength: 8})
    @IsNotEmpty()
    @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minLowercase: 1,
    minUppercase: 1,
    })
    password: string;

    @ApiProperty({required: true, minLength: 10})
    @IsString()
    @IsNotEmpty()
    @Length(10)
    username: string;

    @ApiProperty({required: true})
    @IsString()
    @IsNotEmpty()
    @Length(5)
    address: string;

    @ApiProperty({required: false})
    @IsString()
    @IsNotEmpty()
    @Length(5)
    @IsOptional()
    additionalAddress?: string;

    @ApiProperty({required: true, minLength: 3})
    @IsString()
    @IsNotEmpty()
    @Length(3)
    @IsPostalCode()
    zipCode: string;

    @ApiProperty({required: false, minLength: 8})
    @IsNotEmpty()
    @IsEmail()
    @IsOptional()
    extraEmail?: string;
}