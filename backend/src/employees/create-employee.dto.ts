import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  title: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}