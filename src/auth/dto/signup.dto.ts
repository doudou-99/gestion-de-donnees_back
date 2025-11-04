import { IsEmail, IsString, IsNotEmpty, Length, IsStrongPassword, IsOptional, IsPostalCode } from "class-validator";

export class SignupDto {
    @IsEmail()
    email: string;
    
    @IsString()     
    @IsNotEmpty()    
    @Length(5)     
    username: string;     
      
    @IsString()     
    @IsNotEmpty()     
    @IsStrongPassword({        
      minLength: 8,         
      minNumbers: 2,         
      minSymbols: 1,         
      minUppercase: 1    
    })    
    password: string;    
      
    @IsString()     
    @IsNotEmpty()     
    @Length(5)     
    address: string;      
    
    @IsString()     
    @IsNotEmpty()     
    @Length(5)     
    @IsOptional()     
    additionalAddress?: string;       
    
    @IsNotEmpty()     
    @IsString()    
    zipCode: string;       
    
    @IsEmail()     
    @IsOptional()     
    extraEmail?: string; 
}