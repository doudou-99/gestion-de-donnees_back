import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsNotEmpty, Length, IsStrongPassword, IsOptional, IsPostalCode } from "class-validator";

export class SignupDto {
    @ApiProperty({required: true, uniqueItems: true})
    @IsEmail()
    email: string;
    
    @ApiProperty({required: true, minLength: 5})
    @IsString()     
    @IsNotEmpty()    
    @Length(5)     
    username: string;     
      
    @ApiProperty({required: true, minLength: 8})
    @IsString()     
    @IsNotEmpty()     
    @IsStrongPassword({        
      minLength: 8,         
      minNumbers: 2,         
      minSymbols: 1,         
      minUppercase: 1    
    })    
    password: string;    
    
    @ApiProperty({required: true, minLength:5})
    @IsString()     
    @IsNotEmpty()     
    @Length(5)     
    address: string;      
    
    @ApiProperty({required: false, minLength: 5})
    @IsString()     
    @IsNotEmpty()     
    @Length(5)     
    @IsOptional()     
    additionalAddress?: string;       
    
    @ApiProperty({required: true})
    @IsNotEmpty()     
    @IsString()    
    zipCode: string;       
  
    @ApiProperty({required: false})
    @IsEmail()     
    @IsOptional()     
    extraEmail?: string; 
}