import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ConfirmDTO {
  @ApiProperty({required: true, uniqueItems: true})
  @IsNotEmpty()
  @IsEmail()
  email: string;
}