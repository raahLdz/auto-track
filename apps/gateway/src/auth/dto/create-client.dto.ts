import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+521234567890' })
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, { message: 'phone must be a valid phone number' })
  phone: string;

  @ApiProperty({ example: 'mi_password_seguro', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
