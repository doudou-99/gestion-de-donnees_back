import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, Length, IsStrongPassword, ValidateIf } from 'class-validator';

export class SignupDto {
  @ApiProperty({ required: true, uniqueItems: true })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, minLength: 5 })
  @IsString()
  @IsNotEmpty()
  @Length(5)
  username: string;

  @ApiProperty({ required: true, minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 2,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @ApiProperty({ required: false })
  @ValidateIf((_, value) => value !== '' && value !== undefined)
  @IsEmail()
  extraEmail?: string;
}
