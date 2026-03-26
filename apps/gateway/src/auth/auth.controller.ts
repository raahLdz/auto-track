import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCreatedResponse, ApiConflictResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AUTH_PATTERNS, MICROSERVICE_NAMES } from 'y/common';
import { CreateClientDto } from './dto/create-client.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(MICROSERVICE_NAMES.AUTH) private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registro de cliente', description: 'Registra un nuevo cliente con nombre, apellido, correo y número' })
  @ApiCreatedResponse({ description: 'Cliente registrado exitosamente' })
  @ApiConflictResponse({ description: 'El correo ya está registrado' })
  register(@Body() dto: CreateClientDto) {
    return this.authClient.send(AUTH_PATTERNS.CLIENTS.REGISTER, dto);
  }
}
