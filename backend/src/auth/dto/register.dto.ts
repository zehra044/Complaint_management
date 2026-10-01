import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  contact: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}