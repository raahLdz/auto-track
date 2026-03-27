import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AUTH_PATTERNS } from 'y/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { LoginClientDto } from './dto/login-client.dto';

@Controller()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @MessagePattern(AUTH_PATTERNS.CLIENTS.REGISTER)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  register(@Payload() dto: CreateClientDto) {
    return this.clientsService.register(dto);
  }

  @MessagePattern(AUTH_PATTERNS.CLIENTS.LOGIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  login(@Payload() dto: LoginClientDto) {
    return this.clientsService.login(dto);
  }
}
