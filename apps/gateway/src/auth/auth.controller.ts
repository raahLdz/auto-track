import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCreatedResponse, ApiConflictResponse, ApiOkResponse, ApiUnauthorizedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AUTH_PATTERNS, MICROSERVICE_NAMES } from 'y/common';
import { CreateClientDto } from './dto/create-client.dto';
import { LoginClientDto } from './dto/login-client.dto';

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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de cliente', description: 'Autentica al cliente y devuelve un JWT' })
  @ApiOkResponse({ description: 'Login exitoso, retorna access_token' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  login(@Body() dto: LoginClientDto) {
    return this.authClient.send(AUTH_PATTERNS.CLIENTS.LOGIN, dto);
  }
}
