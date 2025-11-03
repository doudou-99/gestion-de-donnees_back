import { IsNotEmpty, IsEmail, IsStrongPassword, IsString, Length, IsOptional, IsPostalCode } from "class-validator";

export class AddUserDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minLowercase: 1,
    minUppercase: 1,
    })
    password: string;

    @IsString()
    @IsNotEmpty()
    @Length(10)
    username: string;

    @IsString()
    @IsNotEmpty()
    @Length(5)
    address: string;

    @IsString()
    @IsNotEmpty()
    @Length(5)
    @IsOptional()
    additionalAddress?: string;

    @IsString()
    @IsNotEmpty()
    @Length(3)
    @IsPostalCode()
    zipCode: string;

    @IsNotEmpty()
    @IsEmail()
    @IsOptional()
    extraEmail?: string;
}