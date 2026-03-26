import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AUTH_PATTERNS } from 'y/common';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientsService } from './clients.service';

@Controller()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @MessagePattern(AUTH_PATTERNS.CLIENTS.REGISTER)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  register(@Payload() dto: CreateClientDto) {
    return this.clientsService.register(dto);
  }
}
