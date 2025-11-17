import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class SigninDTO {
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
}
