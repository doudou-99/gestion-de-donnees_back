import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class SigninGoogle {
    @ApiProperty({required: true, uniqueItems: true})
    @IsEmail()
    email: string;
    
    @ApiProperty({required: true})
    @IsString()     
    @IsNotEmpty()    
    accessToken: string;   
}