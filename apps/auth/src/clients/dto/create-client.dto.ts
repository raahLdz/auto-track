import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, { message: 'phone must be a valid phone number' })
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;
}
